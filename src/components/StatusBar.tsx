import React from 'react'
import { getFileName } from '../utils/editor-utils'

type AutoSaveState = 'saved' | 'saving' | 'unsaved' | 'error' | 'disabled'
type FileWatchState = 'synced' | 'modified' | 'watching'

interface StatusBarProps {
  filePath: string | null
  isDirty: boolean
  lineCount: number
  charCount: number
  cursorPosition?: { line: number; column: number }
  fileSize?: number
  encoding?: string
  lineEndings?: string
  autoSaveState?: AutoSaveState
  fileWatchState?: FileWatchState
  isLargeFileMode?: boolean
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const StatusBar: React.FC<StatusBarProps> = ({
  filePath,
  isDirty,
  lineCount,
  charCount,
  cursorPosition,
  fileSize,
  encoding = 'UTF-8',
  lineEndings = 'LF',
  autoSaveState,
  fileWatchState,
  isLargeFileMode
}) => {
  const fileName = getFileName(filePath)
  const displayLine = cursorPosition?.line ?? lineCount
  const displayColumn = cursorPosition?.column ?? 1

  const getAutoSaveDisplay = () => {
    switch (autoSaveState) {
      case 'saved': return <span data-testid="auto-save-status">Saved</span>
      case 'saving': return <span data-testid="auto-save-status">Saving...</span>
      case 'unsaved': return <span data-testid="auto-save-status">Unsaved</span>
      case 'error': return <span data-testid="auto-save-status">Error</span>
      default: return null
    }
  }

  const getFileWatchDisplay = () => {
    switch (fileWatchState) {
      case 'synced': return <span data-testid="file-watch-status">Synced</span>
      case 'modified': return <span data-testid="file-watch-status">Modified!</span>
      case 'watching': return <span data-testid="file-watch-status">Watching</span>
      default: return null
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-gray-800 text-gray-300 text-sm border-t border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="font-mono">{fileName || 'Untitled'}</span>
        {isDirty && <span className="text-yellow-400">●</span>}
        {autoSaveState === 'saving' && <span title="Auto-saving" className="text-blue-400 animate-spin">⟳</span>}
        {isLargeFileMode && <span data-testid="large-file-status" title="Large file mode" className="text-orange-400">⚡</span>}
        {fileSize !== undefined && (
          <span data-testid="file-size" title="File size" className="text-gray-500">{formatFileSize(fileSize)}</span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <span data-testid="cursor-position">Ln {displayLine}, Col {displayColumn}</span>
        <span>{charCount} 字符, {lineCount} 行</span>
        {encoding && (
          <span data-testid="encoding" title="File encoding" className="text-gray-400">{encoding}</span>
        )}
        {lineEndings && (
          <span data-testid="line-endings" title="Line endings" className="text-gray-400">{lineEndings}</span>
        )}
        {getAutoSaveDisplay()}
        {getFileWatchDisplay()}
      </div>
    </div>
  )
}

export default StatusBar
