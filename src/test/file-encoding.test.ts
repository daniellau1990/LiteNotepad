import { describe, it, expect } from 'vitest'
import { detectFileEncoding, getEncodingDisplayName } from '../utils/file-encoding'

describe('File Encoding Detection', () => {
  it('should detect UTF-8 with BOM', () => {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF, 0x74, 0x65, 0x73, 0x74])
    expect(detectFileEncoding(bom.buffer)).toBe('UTF-8')
  })

  it('should detect UTF-16LE', () => {
    const bom = new Uint8Array([0xFF, 0xFE, 0x74, 0x00, 0x65, 0x00])
    expect(detectFileEncoding(bom.buffer)).toBe('UTF-16LE')
  })

  it('should detect UTF-16BE', () => {
    const bom = new Uint8Array([0xFE, 0xFF, 0x00, 0x74, 0x00, 0x65])
    expect(detectFileEncoding(bom.buffer)).toBe('UTF-16BE')
  })

  it('should detect ASCII', () => {
    const ascii = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]) // Hello
    expect(detectFileEncoding(ascii.buffer)).toBe('ASCII')
  })

  it('should get encoding display names', () => {
    expect(getEncodingDisplayName('UTF-8')).toBe('UTF-8')
    expect(getEncodingDisplayName('UTF-16LE')).toBe('UTF-16 LE')
    expect(getEncodingDisplayName('UNKNOWN')).toBe('Unknown')
  })
})