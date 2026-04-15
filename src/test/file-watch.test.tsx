import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileWatch } from '../hooks/useFileWatch'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn()
}))

import { invoke } from '@tauri-apps/api/tauri'

describe('useFileWatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(invoke).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize as synced when no file', () => {
    const { result } = renderHook(() => useFileWatch(null, 'content'))
    
    expect(result.current.state).toBe('synced')
  })

  it('should start watching when file path provided', async () => {
    vi.mocked(invoke).mockResolvedValue(1234567890)
    
    const { result } = renderHook(() => useFileWatch('/test.txt', 'content'))
    
    expect(result.current.state).toBe('watching')
  })

  it('should detect file modification', async () => {
    let modifiedTime = 1234567890
    vi.mocked(invoke).mockImplementation(() => Promise.resolve(modifiedTime))
    
    const { result } = renderHook(() => 
      useFileWatch('/test.txt', 'content', { pollInterval: 1000 })
    )
    
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    
    expect(result.current.state).toBe('watching')
    
    // Simulate file modification
    modifiedTime = 1234567891
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    
    expect(result.current.state).toBe('modified')
  })

  it('should resolve modification by reloading', async () => {
    vi.mocked(invoke).mockResolvedValue(1234567890)
    
    const { result } = renderHook(() => useFileWatch('/test.txt', 'content'))
    
    await act(async () => {
      const action = await result.current.resolveModification('reload')
      expect(action).toBe('reload')
    })
    
    expect(result.current.state).toBe('synced')
  })
})