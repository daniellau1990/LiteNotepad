import React, { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { basicSetup } from '@codemirror/basic-setup'
import { javascript } from '@codemirror/lang-javascript'
import { markdown } from '@codemirror/lang-markdown'
import { json } from '@codemirror/lang-json'
import { calculateCursorPosition } from '../utils/cursor-position'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onCursorChange?: (position: { line: number; column: number }) => void
  filePath: string | null
  isLargeFile?: boolean
}

const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  onCursorChange,
  filePath, 
  isLargeFile = false 
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const language = (() => {
      if (!filePath) return null
      const ext = filePath.split('.').pop()?.toLowerCase()
      switch (ext) {
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
          return javascript()
        case 'md':
        case 'markdown':
          return markdown()
        case 'json':
          return json()
        default:
          return null
      }
    })()

    const extensions = [
      basicSetup,
      lineNumbers(),
      EditorView.lineWrapping,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()
          onChange(newContent)
        }
      if (update.selectionSet && onCursorChange) {
        const position = calculateCursorPosition(
          update.state.doc,
          update.state.selection.main.from
        )
        onCursorChange(position)
      }
      }),
      ...(language ? [language] : [])
    ]

    const stateConfig: any = {
      doc: content,
      extensions
    }

    // 大文件优化
    if (isLargeFile) {
      stateConfig.undoDepth = 50 // 减少撤销历史深度
      console.log('Large file mode enabled: reduced undo depth to 50')
    }

    const state = EditorState.create(stateConfig)

    const view = new EditorView({
      state,
      parent: editorRef.current
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [filePath, isLargeFile, onChange, onCursorChange])

  useEffect(() => {
    const view = viewRef.current
    if (view) {
      const currentContent = view.state.doc.toString()
      if (currentContent !== content) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content
          }
        })
      }
    }
  }, [content])

  return (
    <div 
      ref={editorRef}
      className="h-full w-full overflow-auto"
    />
  )
}

export default Editor