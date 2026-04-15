import React from 'react'
import { getFileName, formatCursorPosition } from '../utils/editor-utils'

interface StatusBarProps {
  filePath: string | null
  isDirty: boolean
  lineCount: number
  charCount: number
  cursorPosition?: { line: number; column: number }
  fileSize?: number
  encoding?: string
  lineEndings?: string
  autoSaveState?: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedTime?: number | null
  fileWatchState?: 'synced' | 'watching' | 'modified' | 'error'
  isLargeFileMode?: boolean
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  filePath, 
  isDirty, 
  lineCount, 
  charCount,
  cursorPosition,
  fileSize = 0,
  encoding = 'UTF-8',
  lineEndings,
  autoSaveState = 'idle',
  lastSavedTime = null,
  fileWatchState = 'synced',
  isLargeFileMode = false
}) => {
  const fileName = getFileName(filePath)
  const { displayLine, displayColumn } = formatCursorPosition(cursorPosition, lineCount)
  
  return (
    <div className="flex items-center justify-between px-4 py-1 bg-gray-800 text-gray-300 text-sm border-t border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="mr-2">File:</span>
          <span className="font-mono text-gray-200" title={filePath || ''}>
            {fileName}
          </span>
          {isDirty && (
            <span className="ml-2 text-yellow-400" title="Unsaved changes">●</span>
          )}
          {isLargeFileMode && (
            <span className="ml-2 text-blue-400" title="Large file mode">⏳</span>
          )}
        </div>
        <div className="hidden md:block">
          <span className="text-gray-500">|</span>
          <span className="mx-2">Path:</span>
          <span className="font-mono text-gray-200 truncate max-w-xs" title={filePath || ''}>
            {filePath || 'No file open'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="mr-1">Ln</span>
          <span className="font-mono">{displayLine}</span>
          <span className="mx-2">Col</span>
          <span className="font-mono">{displayColumn}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-gray-500">|</span>
          <span className="mx-2">Chars:</span>
          <span className="font-mono">{charCount}</span>
        </div>
        {fileSize > 0 && (
          <div className="hidden sm:flex items-center space-x-1">
            <span className="text-gray-500">|</span>
            <span className="mx-2" title="File size">
              {(fileSize / 1024).toFixed(1)}KB
            </span>
          </div>
        )}
        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-gray-500">|</span>
          <span className="mx-2 font-mono" title="File encoding">
            {encoding}
          </span>
        </div>
        {lineEndings && (
          <div className="hidden md:flex items-center space-x-1">
            <span className="text-gray-500">|</span>
            <span className="mx-2 font-mono" title="Line endings">
              {lineEndings}
            </span>
          </div>
        )}
        <div className="flex items-center space-x-3">
          {autoSaveState !== 'idle' && (
            <div className="flex items-center space-x-1">
              {autoSaveState === 'saving' && <span className="text-green-400" title="Auto-saving">🔄</span>}
              {autoSaveState === 'saved' && <span className="text-green-600" title="Auto-saved">✓</span>}
              {autoSaveState === 'error' && <span className="text-red-400" title="Auto-save error">⚠️</span>}
              <span className="font-mono text-xs">
                {autoSaveState === 'saving' && 'Saving...'}
                {autoSaveState === 'saved' && 'Saved'}
                {autoSaveState === 'error' && 'Error'}
              </span>
            </div>
          )}
          {fileWatchState !== 'synced' && (
            <div className="flex items-center space-x-1">
              {fileWatchState === 'watching' && <span className="text-purple-400" title="File watched">👁️</span>}
              {fileWatchState === 'modified' && <span className="text-yellow-400" title="File modified externally">⚠️</span>}
              {fileWatchState === 'error' && <span className="text-red-400" title="File watch error">⚠️</span>}
              <span className="font-mono text-xs">
                {fileWatchState === 'watching' && 'Watching'}
                {fileWatchState === 'modified' && 'Modified'}
                {fileWatchState === 'error' && 'Error'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusBar