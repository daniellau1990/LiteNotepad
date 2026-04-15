import { describe, it, expect } from 'vitest'
import { detectLineEnding, getLineEndingDisplayName } from '../utils/line-ending'

describe('Line Ending Detection', () => {
  it('should detect CRLF', () => {
    expect(detectLineEnding('Hello\r\nWorld\r\n')).toBe('CRLF')
  })

  it('should detect LF', () => {
    expect(detectLineEnding('Hello\nWorld\n')).toBe('LF')
  })

  it('should detect CR', () => {
    expect(detectLineEnding('Hello\rWorld\r')).toBe('CR')
  })

  it('should detect mixed line endings', () => {
    expect(detectLineEnding('Hello\r\nWorld\n')).toBe('MIXED')
  })

  it('should detect unknown when no line endings', () => {
    expect(detectLineEnding('Hello World')).toBe('UNKNOWN')
  })

  it('should get display names', () => {
    expect(getLineEndingDisplayName('CRLF')).toBe('CRLF')
    expect(getLineEndingDisplayName('MIXED')).toBe('Mixed')
  })
})