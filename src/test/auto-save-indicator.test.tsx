import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Auto-Save Indicator', () => {
  it('should show saved state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-8"
        lineEndings="LF"
        autoSaveState="saved"
      />
    )
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('should show saving state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-8"
        lineEndings="LF"
        autoSaveState="saving"
      />
    )
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('should show unsaved state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-8"
        lineEndings="LF"
        autoSaveState="unsaved"
      />
    )
    expect(screen.getByText('Unsaved')).toBeInTheDocument()
  })

  it('should show error state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFileMode={false}
        encoding="UTF-8"
        lineEndings="LF"
        autoSaveState="error"
      />
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})