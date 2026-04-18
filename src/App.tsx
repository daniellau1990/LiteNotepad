import React, { useState, useEffect, useCallback, useRef } from 'react'
import { EditorView } from '@codemirror/view'
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
  const editorViewRef = useRef<EditorView | null>(null)

  const handleUndo = () => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({ undo: true })
    }
  }

  const handleRedo = () => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({ redo: true })
    }
  }

  const handleCut = () => {
    document.execCommand('cut')
  }

  const handleCopy = () => {
    document.execCommand('copy')
  }

  const handlePaste = () => {
    document.execCommand('paste')
  }

  const handleSelectAll = () => {
    if (editorViewRef.current) {
      const doc = editorViewRef.current.state.doc
      editorViewRef.current.dispatch({
        selection: { anchor: 0, head: doc.length }
      })
    }
  }

  const wrapSelection = (wrapper: string) => {
    const view = editorViewRef.current
    if (!view) return

    const { from, to } = view.state.selection.main
    const selectedText = view.state.doc.sliceString(from, to)

    const newText = wrapper + selectedText + wrapper
    view.dispatch({
      changes: { from, to, insert: newText },
      selection: { anchor: from + wrapper.length, head: to + wrapper.length }
    })
    view.focus()
  }

  const handleBold = () => wrapSelection('**')
  const handleItalic = () => wrapSelection('*')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') handleUndo()
      if (e.ctrlKey && e.key === 'y') handleRedo()
      if (e.ctrlKey && e.key === 'x') handleCut()
      if (e.ctrlKey && e.key === 'c') handleCopy()
      if (e.ctrlKey && e.key === 'v') handlePaste()
      if (e.ctrlKey && e.key === 'a') handleSelectAll()
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); handleBold() }
      if (e.ctrlKey && e.key === 'i') { e.preventDefault(); handleItalic() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Text Files',
          extensions: ['txt', 'md', 'js', 'json', 'ts', 'tsx', 'html', 'css']
        }]
      })
      if (selected && !Array.isArray(selected)) {
        const size = await invoke<number>('get_file_size', { path: selected })
        setFileSize(size)
        
        const largeFile = isLargeFileUtil(size)
        setIsLargeFile(largeFile)
        setIsStreamingMode(largeFile)
        
        if (largeFile) {
          console.log(`Loading large file: ${(size / 1024 / 1024).toFixed(2)}MB, streaming mode enabled`)
        }
        
        const binaryData = await readBinaryFile(selected)
        const encoding = detectFileEncoding(binaryData.buffer)
        setEncoding(getEncodingDisplayName(encoding))
        
        let fileContent: string
        if (encoding === 'UTF-16LE' || encoding === 'UTF-16BE') {
          const decoder = new TextDecoder(encoding.toLowerCase())
          fileContent = decoder.decode(binaryData)
        } else {
          fileContent = await readTextFile(selected)
        }
        
        setContent(fileContent)
        setFilePath(selected)
        setIsDirty(false)
        
        const lineEnding = detectLineEnding(fileContent)
        setLineEndings(getLineEndingDisplayName(lineEnding))
      }
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }, [])

  // 处理文件修改提示
  useEffect(() => {
    if (fileWatchState === 'modified') {
      const userChoice = window.confirm(
        '文件已被其他程序修改。重新加载（丢失本地更改）还是保留（覆盖外部更改）？\n\n点击"确定"重新加载，"取消"保留。'
      )
      
      if (userChoice) {
        resolveModification('reload')
        handleOpenFile()
      } else {
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

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (!isDirty) setIsDirty(true)
  }

  const handleSave = async (path?: string) => {
    const savePath = path || filePath
    if (!savePath) return

    if (path && path !== filePath) {
      setFilePath(path)
    }

    await triggerSave()
  }

  useEffect(() => {
    const unsubscribe = appWindow.onCloseRequested(async (event) => {
      if (isDirty) {
        event.preventDefault()
        const userChoice = window.confirm(
          '有未保存的更改。保存后关闭？\n\n点击"确定"保存，"取消"放弃更改。'
        )
        if (userChoice) {
          await triggerSave()
          setIsDirty(false)
        }
        await appWindow.close()
      }
    })
    return () => { unsubscribe.then(fn => fn()) }
  }, [isDirty, filePath, triggerSave])

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <MenuBar onOpen={handleOpenFile} onSave={handleSave} editorViewRef={editorViewRef} />
      <div className="flex-1 overflow-hidden">
        <Editor 
          content={content} 
          onChange={handleContentChange}
          onCursorChange={setCursorPosition}
          filePath={filePath}
          isLargeFile={isLargeFile}
          viewRef={editorViewRef}
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