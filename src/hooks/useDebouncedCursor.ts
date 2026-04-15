/**
 * 防抖光标位置钩子
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { CursorPosition } from '../utils/cursor-position'

export function useDebouncedCursor(
  initialPosition: CursorPosition | null = null,
  delay: number = 100
): [CursorPosition | null, (position: CursorPosition) => void] {
  const [position, setPosition] = useState<CursorPosition | null>(initialPosition)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updatePosition = useCallback((newPosition: CursorPosition) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setPosition(newPosition)
    }, delay)
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [position, updatePosition]
}