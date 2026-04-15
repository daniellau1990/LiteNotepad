import { describe, it, expect } from 'vitest'
import { isLargeFile, formatFileSize, getLargeFileThreshold } from '../utils/file-size'

describe('File Size Utilities', () => {
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

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1500)).toBe('1.5 KB')
      expect(formatFileSize(1024)).toBe('1.0 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(3.7 * 1024 * 1024 * 1024)).toBe('3.7 GB')
    })
  })

  describe('getLargeFileThreshold', () => {
    it('should return correct threshold', () => {
      const threshold = getLargeFileThreshold()
      expect(threshold.size).toBe(5 * 1024 * 1024)
      expect(threshold.description).toBe('5MB')
    })
  })
})