import { describe, it, expect } from 'vitest'
import { calculateCursorPosition, formatCursorPosition, validateCursorPosition } from '../utils/cursor-position'

describe('Cursor Position Utilities', () => {
  it('should calculate cursor position correctly', () => {
    const mockDoc = {
      lineAt: (pos: number) => {
        if (pos === 15) return { number: 2, from: 10 }
        return { number: 1, from: 0 }
      }
    }
    
    const position = calculateCursorPosition(mockDoc as any, 15)
    expect(position).toEqual({ line: 2, column: 6 })
  })

  it('should format cursor position', () => {
    const position = { line: 5, column: 25 }
    expect(formatCursorPosition(position)).toBe('Ln 5, Col 25')
    expect(formatCursorPosition(position, '{line}:{column}')).toBe('5:25')
  })

  it('should validate cursor position', () => {
    expect(validateCursorPosition({ line: 0, column: 0 }, 10)).toEqual({ line: 1, column: 1 })
    expect(validateCursorPosition({ line: 15, column: 100 }, 10)).toEqual({ line: 10, column: 100 })
    expect(validateCursorPosition({ line: 5, column: -5 }, 10)).toEqual({ line: 5, column: 1 })
  })
})