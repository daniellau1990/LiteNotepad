import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Cursor Position Indicator', () => {
  it('should display default cursor position when no cursor data', () => {
    render(<StatusBar filePath="test.txt" isDirty={false} lineCount={10} charCount={100} />)
    expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 10, Col 1')
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
    expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 5, Col 25')
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

    expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 1, Col 1')

    rerender(
      <StatusBar
        filePath="test.txt"
        isDirty={false}
        lineCount={10}
        charCount={100}
        cursorPosition={{ line: 10, column: 50 }}
      />
    )

    expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 10, Col 50')
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
  
  it('should show auto-saving indicator when autoSaveState is saving', () => {
    render(
      <StatusBar
        filePath="test.txt"
        isDirty={false}
        lineCount={10}
        charCount={100}
        autoSaveState="saving"
      />
    )
    expect(screen.getByTitle('Auto-saving')).toBeInTheDocument()
  })

  it('should show file watched indicator when fileWatchState is watching', () => {
    render(
      <StatusBar
        filePath="test.txt"
        isDirty={false}
        lineCount={10}
        charCount={100}
        fileWatchState="watching"
      />
    )
    expect(screen.getByTestId('file-watch-status')).toHaveTextContent('Watching')
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