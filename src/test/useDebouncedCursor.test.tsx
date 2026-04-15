import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedCursor } from '../hooks/useDebouncedCursor'

describe('useDebouncedCursor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with null position', () => {
    const { result } = renderHook(() => useDebouncedCursor())
    expect(result.current[0]).toBeNull()
  })

  it('should update position after delay', () => {
    const { result } = renderHook(() => useDebouncedCursor(null, 100))
    
    act(() => {
      result.current[1]({ line: 5, column: 25 })
    })
    
    expect(result.current[0]).toBeNull()
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current[0]).toEqual({ line: 5, column: 25 })
  })

  it('should cancel previous update on new call', () => {
    const { result } = renderHook(() => useDebouncedCursor(null, 100))
    
    act(() => {
      result.current[1]({ line: 1, column: 1 })
    })
    
    act(() => {
      vi.advanceTimersByTime(50)
      result.current[1]({ line: 2, column: 2 })
    })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current[0]).toEqual({ line: 2, column: 2 })
  })
})