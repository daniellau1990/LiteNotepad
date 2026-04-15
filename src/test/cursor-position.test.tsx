import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Cursor Position Indicator', () => {
  it('should display default cursor position when no cursor data', () => {
    render(<StatusBar filePath="test.txt" isDirty={false} lineCount={10} charCount={100} />)
    expect(screen.getByText('Ln 10')).toBeInTheDocument()
    expect(screen.getByText('Col 1')).toBeInTheDocument()
  })

  it('should display dynamic cursor position when provided', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        cursorPosition={{ line: 5, column: 25 }}
      />
    )
    expect(screen.getByText('Ln 5')).toBeInTheDocument()
    expect(screen.getByText('Col 25')).toBeInTheDocument()
  })

  it('should update cursor position when props change', () => {
    const { rerender } = render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        cursorPosition={{ line: 1, column: 1 }}
      />
    )
    
    expect(screen.getByText('Ln 1')).toBeInTheDocument()
    
    rerender(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        cursorPosition={{ line: 10, column: 50 }}
      />
    )
    
    expect(screen.getByText('Ln 10')).toBeInTheDocument()
    expect(screen.getByText('Col 50')).toBeInTheDocument()
  })
  
  it('should display file size when provided', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        fileSize={10240} // 10KB
      />
    )
    expect(screen.getByTitle('File size')).toBeInTheDocument()
  })
  
  it('should display encoding', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        encoding="UTF-8"
      />
    )
    expect(screen.getByTitle('File encoding')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument()
  })
  
  it('should display line endings when provided', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        lineEndings="LF"
      />
    )
    expect(screen.getByTitle('Line endings')).toBeInTheDocument()
    expect(screen.getByText('LF')).toBeInTheDocument()
  })
  
  it('should show auto-saving indicator when isAutoSaving is true', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isAutoSaving={true}
      />
    )
    expect(screen.getByTitle('Auto-saving')).toBeInTheDocument()
  })
  
  it('should show file watched indicator when isFileWatched is true', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isFileWatched={true}
      />
    )
    expect(screen.getByTitle('File watched')).toBeInTheDocument()
  })
  
  it('should show large file mode indicator when isLargeFileMode is true', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={true}
      />
    )
    expect(screen.getByTitle('Large file mode')).toBeInTheDocument()
  })
})