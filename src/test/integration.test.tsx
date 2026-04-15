import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('StatusBar Integration', () => {
  it('should render all indicators together', () => {
    render(
      <StatusBar 
        filePath="/projects/test.txt" 
        isDirty={true} 
        lineCount={42} 
        charCount={1500}
        cursorPosition={{ line: 15, column: 25 }}
        isLargeFileMode={true}
        encoding="UTF-8"
        lineEndings="CRLF"
        autoSaveState="saving"
        fileWatchState="watching"
      />
    )
    
    // Check all indicators are present
    expect(screen.getByText('test.txt')).toBeInTheDocument()
    expect(screen.getByText('●')).toBeInTheDocument() // Dirty indicator
    expect(screen.getByText('Ln 15')).toBeInTheDocument()
    expect(screen.getByText('Col 25')).toBeInTheDocument()
    expect(screen.getByTitle('Large file mode')).toBeInTheDocument()
    expect(screen.getByTitle('File encoding')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument()
    expect(screen.getByTitle('Line endings')).toBeInTheDocument()
    expect(screen.getByText('CRLF')).toBeInTheDocument()
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Watching')).toBeInTheDocument()
  })

  it('should handle minimal props', () => {
    render(
      <StatusBar 
        filePath={null} 
        isDirty={false} 
        lineCount={0} 
        charCount={0}
      />
    )
    
    expect(screen.getByText('Untitled')).toBeInTheDocument()
    expect(screen.getByText('Ln 0')).toBeInTheDocument()
    expect(screen.getByText('Col 1')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument() // Default
    expect(screen.getByText('LF')).toBeInTheDocument() // Default
    expect(screen.getByText('Saved')).toBeInTheDocument() // Default
    expect(screen.getByText('Synced')).toBeInTheDocument() // Default
  })
})