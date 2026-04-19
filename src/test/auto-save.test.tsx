import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../hooks/useAutoSave'

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize as saved', () => {
    const onSave = vi.fn()
    const { result } = renderHook(() => useAutoSave('initial', { onSave }))
    
    expect(result.current.state).toBe('saved')
    expect(result.current.isDirty).toBe(false)
  })

  it('should mark as unsaved when content changes', () => {
    const onSave = vi.fn()
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave }),
      { initialProps: { content: 'initial' } }
    )
    
    expect(result.current.state).toBe('saved')
    
    rerender({ content: 'updated' })
    
    expect(result.current.state).toBe('unsaved')
    expect(result.current.isDirty).toBe(true)
  })

  it('should auto-save after interval', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, saveInterval: 1000 }),
      { initialProps: { content: 'initial' } }
    )

    rerender({ content: 'updated' })
    expect(result.current.state).toBe('unsaved')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(onSave).toHaveBeenCalledWith('updated')
    expect(result.current.state).toBe('saved')
  })

  it('should handle save errors', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave }),
      { initialProps: { content: 'initial' } }
    )
    
    rerender({ content: 'updated' })
    
    await act(async () => {
      await result.current.save()
    })
    
    expect(result.current.state).toBe('error')
    expect(result.current.error).toBe('Save failed')
  })
})