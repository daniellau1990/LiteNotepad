import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Line Ending Indicator', () => {
  it('should show default LF line ending', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-8"
      />
    )
    expect(screen.getByTitle('Line endings')).toBeInTheDocument()
    expect(screen.getByText('LF')).toBeInTheDocument()
  })

  it('should show custom line ending', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-8"
        lineEndings="CRLF"
      />
    )
    expect(screen.getByText('CRLF')).toBeInTheDocument()
  })
})