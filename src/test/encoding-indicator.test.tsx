import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Encoding Indicator', () => {
  it('should show default UTF-8 encoding', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
      />
    )
    expect(screen.getByTitle('File encoding')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument()
  })

  it('should show custom encoding', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-16 LE"
      />
    )
    expect(screen.getByText('UTF-16 LE')).toBeInTheDocument()
  })
})