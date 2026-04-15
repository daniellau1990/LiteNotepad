import { describe, it, expect } from 'vitest'
import { 
  getFileName, 
  formatCursorPosition, 
  isLargeFile, 
  detectEncoding,
  detectLineEndings 
} from '../utils/editor-utils'

describe('Editor Utilities', () => {
  describe('getFileName', () => {
    it('should return "Untitled" for null filePath', () => {
      expect(getFileName(null)).toBe('Untitled')
    })

    it('should extract filename from Windows path', () => {
      expect(getFileName('C:\\Users\\test\\documents\\file.txt')).toBe('file.txt')
    })

    it('should extract filename from Unix path', () => {
      expect(getFileName('/home/user/documents/file.txt')).toBe('file.txt')
    })

    it('should return original path if no separator found', () => {
      expect(getFileName('file.txt')).toBe('file.txt')
    })
  })

  describe('formatCursorPosition', () => {
    it('should use cursor position when provided', () => {
      const result = formatCursorPosition({ line: 5, column: 25 }, 100)
      expect(result.displayLine).toBe(5)
      expect(result.displayColumn).toBe(25)
    })

    it('should use lineCount as default when cursor position not provided', () => {
      const result = formatCursorPosition(undefined, 100)
      expect(result.displayLine).toBe(100)
      expect(result.displayColumn).toBe(1)
    })

    it('should use line 1 as default when neither cursor nor lineCount provided', () => {
      const result = formatCursorPosition()
      expect(result.displayLine).toBe(1)
      expect(result.displayColumn).toBe(1)
    })
  })

  describe('isLargeFile', () => {
    it('should return true for files larger than 5MB', () => {
      expect(isLargeFile(6 * 1024 * 1024)).toBe(true)
    })

    it('should return false for files smaller than 5MB', () => {
      expect(isLargeFile(4 * 1024 * 1024)).toBe(false)
    })

    it('should return false for files exactly 5MB', () => {
      expect(isLargeFile(5 * 1024 * 1024)).toBe(false)
    })
  })

  describe('detectEncoding', () => {
    it('should return UTF-8 by default', () => {
      expect(detectEncoding('test content')).toBe('UTF-8')
    })
  })

  describe('detectLineEndings', () => {
    it('should detect LF line endings', () => {
      const content = 'line1\nline2\nline3'
      expect(detectLineEndings(content)).toBe('LF')
    })

    it('should detect CRLF line endings', () => {
      const content = 'line1\r\nline2\r\nline3'
      expect(detectLineEndings(content)).toBe('CRLF')
    })

    it('should detect CR line endings', () => {
      const content = 'line1\rline2\rline3'
      expect(detectLineEndings(content)).toBe('CR')
    })

    it('should detect mixed line endings', () => {
      const content = 'line1\r\nline2\nline3\r'
      expect(detectLineEndings(content)).toBe('Mixed')
    })

    it('should handle empty content', () => {
      expect(detectLineEndings('')).toBe('LF') // 空内容默认返回LF
    })
  })
})