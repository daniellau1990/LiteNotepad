/**
 * 自动保存钩子
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export type AutoSaveState = 'saved' | 'saving' | 'unsaved' | 'error'

export interface UseAutoSaveOptions {
  saveInterval?: number  // ms between auto-saves
  debounceDelay?: number // ms of inactivity before marking dirty
  onSave?: (content: string) => Promise<void>
}

export function useAutoSave(
  content: string,
  options: UseAutoSaveOptions = {}
) {
  const {
    saveInterval = 60000, // 60 seconds
    debounceDelay = 500,  // 500ms
    onSave
  } = options

  const [state, setState] = useState<AutoSaveState>('saved')
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const contentRef = useRef(content)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mark as dirty when content changes
  useEffect(() => {
    if (content !== contentRef.current) {
      contentRef.current = content
      
      if (state === 'saved') {
        setState('unsaved')
      }
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [content, state])

  // Auto-save on interval
  useEffect(() => {
    if (!onSave || state !== 'unsaved') return

    intervalRef.current = setInterval(() => {
      performSave()
    }, saveInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onSave, saveInterval, state])

  const performSave = useCallback(async () => {
    if (!onSave || state === 'saved' || state === 'saving') return

    try {
      setState('saving')
      setError(null)
      await onSave(contentRef.current)
      setState('saved')
      setLastSavedTime(new Date())
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Save failed')
      console.error('Auto-save failed:', err)
    }
  }, [onSave, state])

  // Manual save trigger
  const save = useCallback(async () => {
    await performSave()
  }, [performSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    state,
    lastSavedTime,
    error,
    save,
    isDirty: state === 'unsaved' || state === 'error'
  }
}