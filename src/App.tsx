import React, { useState, useEffect } from 'react'
import Editor from './components/Editor'
import StatusBar from './components/StatusBar'
import MenuBar from './components/MenuBar'
import { readTextFile, readBinaryFile } from '@tauri-apps/api/fs'
import { open } from '@tauri-apps/api/dialog'
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'
import { isLargeFile as isLargeFileUtil } from './utils/file-size'
import { detectFileEncoding, getEncodingDisplayName } from './utils/file-encoding'
import { detectLineEnding, getLineEndingDisplayName } from './utils/line-ending'
import { useAutoSave } from './hooks/useAutoSave'
import { useFileWatch } from './hooks/useFileWatch'

function App() {
  const [content, setContent] = useState('')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [lineCount, setLineCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isLargeFile, setIsLargeFile] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number } | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [encoding, setEncoding] = useState<string>('UTF-8')
const [lineEndings, setLineEndings] = useState<string>('LF')
const [isStreamingMode, setIsStreamingMode] = useState<boolean>(false)
const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false)
  const [isFileWatched, setIsFileWatched] = useState<boolean>(false)

  // 自动保存钩子
  const {
    state: autoSaveState,
    lastSavedTime,
    save: triggerSave,
    isDirty: isAutoSaveDirty
  } = useAutoSave(content, {
    saveInterval: 60000,
    debounceDelay: 500,
    onSave: async (contentToSave) => {
      if (!filePath) return
      try {
        await invoke('write_file', { 
          path: filePath, 
          content: contentToSave 
        })
        console.log('Auto-save successful:', filePath)
      } catch (error) {
        console.error('Auto-save failed:', error)
        throw error // 让 useAutoSave 钩子处理错误状态
      }
    }
  })

  // 同步 isDirty 状态
  useEffect(() => {
    setIsDirty(isAutoSaveDirty)
  }, [isAutoSaveDirty])

  // 文件监视钩子
  const {
    state: fileWatchState,
    resolveModification
  } = useFileWatch(filePath, content, {
    pollInterval: 30000,
    enabled: !!filePath
  })

  // 处理文件修改提示
  useEffect(() => {
    if (fileWatchState === 'modified') {
      // 显示对话框给用户
      const userChoice = window.confirm(
        '文件已被其他程序修改。重新加载（丢失本地更改）还是保留（覆盖外部更改）？\n\n点击"确定"重新加载，"取消"保留。'
      )
      
      if (userChoice) {
        // 重新加载文件
        resolveModification('reload')
        handleOpenFile() // 重新打开文件以重新加载
      } else {
        // 保留本地更改
        resolveModification('overwrite')
      }
    }
  }, [fileWatchState, resolveModification, handleOpenFile])

  useEffect(() => {
    const updateCounts = () => {
      setLineCount(content.split('\n').length)
      setCharCount(content.length)
    }
    updateCounts()
  }, [content])

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Text Files',
          extensions: ['txt', 'md', 'js', 'json', 'ts', 'tsx', 'html', 'css']
        }]
      })
      if (selected && !Array.isArray(selected)) {
        // 检测文件大小
        const size = await invoke<number>('get_file_size', { path: selected })
        setFileSize(size)
        
        const largeFile = isLargeFileUtil(size)
        setIsLargeFile(largeFile)
        setIsStreamingMode(largeFile)
        
        if (largeFile) {
          console.log(`Loading large file: ${(size / 1024 / 1024).toFixed(2)}MB, streaming mode enabled`)
          // 未来可以在这里实现分块加载
        }
        
        // 读取二进制文件以检测编码
        const binaryData = await readBinaryFile(selected)
        const encoding = detectFileEncoding(binaryData.buffer)
        setEncoding(getEncodingDisplayName(encoding))
        
        // 将二进制数据转换为字符串（根据检测到的编码）
        let fileContent: string
        if (encoding === 'UTF-16LE' || encoding === 'UTF-16BE') {
          // 对于UTF-16，使用TextDecoder
          const decoder = new TextDecoder(encoding.toLowerCase())
          fileContent = decoder.decode(binaryData)
        } else {
          // 对于UTF-8和ASCII，直接使用TextDecoder或readTextFile
          // 使用readTextFile，它应该能正确处理UTF-8 BOM
          fileContent = await readTextFile(selected)
        }
        
        setContent(fileContent)
        setFilePath(selected)
        setIsDirty(false)
        
        // 检测行结束符
        const lineEnding = detectLineEnding(fileContent)
        setLineEndings(getLineEndingDisplayName(lineEnding))
        
        // 文件监视由 useFileWatch 钩子自动处理
      }
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (!isDirty) setIsDirty(true)
  }

  const handleSave = async () => {
    if (!filePath) return
    await triggerSave()
  }

  useEffect(() => {
    const unsubscribe = appWindow.onCloseRequested(async (event) => {
      if (isDirty) {
        // Implement save confirmation dialog
        event.preventDefault()
      }
    })
    return () => {
      unsubscribe.then(fn => fn())
    }
  }, [isDirty])

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <MenuBar onOpen={handleOpenFile} onSave={handleSave} />
      <div className="flex-1 overflow-hidden">
        <Editor 
          content={content} 
          onChange={handleContentChange}
          onCursorChange={setCursorPosition}
          filePath={filePath}
          isLargeFile={isLargeFile}
        />
      </div>
      <StatusBar 
        filePath={filePath}
        isDirty={isDirty}
        lineCount={lineCount}
        charCount={charCount}
        cursorPosition={cursorPosition || undefined}
        fileSize={fileSize}
        encoding={encoding}
        lineEndings={lineEndings}
        autoSaveState={autoSaveState}
        lastSavedTime={lastSavedTime}
        fileWatchState={fileWatchState}
        isLargeFileMode={isLargeFile}
      />
    </div>
  )
}

export default App