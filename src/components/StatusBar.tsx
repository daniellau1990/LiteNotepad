import React from 'react'
import { getFileName } from '../utils/editor-utils'

interface StatusBarProps {
  filePath: string | null
  isDirty: boolean
  lineCount: number
  charCount: number
  cursorPosition?: { line: number; column: number }
}

const StatusBar: React.FC<StatusBarProps> = ({
  filePath,
  isDirty,
  lineCount,
  charCount,
  cursorPosition
}) => {
  const fileName = getFileName(filePath)
  const displayLine = cursorPosition?.line ?? lineCount
  const displayColumn = cursorPosition?.column ?? 1

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-gray-800 text-gray-300 text-sm border-t border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="font-mono">{fileName || 'Untitled'}</span>
        {isDirty && <span className="text-yellow-400">●</span>}
      </div>
      <div className="flex items-center space-x-4">
        <span>Ln {displayLine}, Col {displayColumn}</span>
        <span>{charCount} 字符, {lineCount} 行</span>
      </div>
    </div>
  )
}

export default StatusBar
