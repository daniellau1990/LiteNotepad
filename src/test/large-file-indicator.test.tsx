import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Large File Indicator', () => {
  it('should not show large file indicator by default', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
      />
    )
    expect(screen.queryByTitle('Large file mode')).not.toBeInTheDocument()
  })

  it('should show large file indicator when isLargeFileMode is true', () => {
    render(
      <StatusBar 
        filePath="large.txt" 
        isDirty={false} 
        lineCount={1000} 
        charCount={100000}
        isLargeFileMode={true}
      />
    )
    expect(screen.getByTitle('Large file mode')).toBeInTheDocument()
  })

  it('should show tooltip on hover', () => {
    render(
      <StatusBar 
        filePath="large.txt" 
        isDirty={false} 
        lineCount={1000} 
        charCount={100000}
        isLargeFileMode={true}
      />
    )
    const indicator = screen.getByTitle('Large file mode')
    expect(indicator).toBeInTheDocument()
  })
})