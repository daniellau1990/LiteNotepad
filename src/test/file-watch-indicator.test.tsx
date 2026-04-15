import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('File Watch Indicator', () => {
  it('should show synced state', () => {
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
        fileWatchState="synced"
      />
    )
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('should show modified state', () => {
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
        fileWatchState="modified"
      />
    )
    expect(screen.getByText('Modified!')).toBeInTheDocument()
  })

  it('should show watching state', () => {
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
        fileWatchState="watching"
      />
    )
    expect(screen.getByText('Watching')).toBeInTheDocument()
  })
})