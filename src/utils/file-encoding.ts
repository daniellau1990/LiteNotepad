/**
 * 文件编码检测工具函数
 */

export type FileEncoding = 'UTF-8' | 'UTF-16LE' | 'UTF-16BE' | 'ASCII' | 'ISO-8859-1' | 'UNKNOWN'

/**
 * 检测文件编码（通过BOM标记）
 * @param buffer 文件内容的ArrayBuffer
 * @returns 检测到的编码类型
 */
export function detectFileEncoding(buffer: ArrayBuffer): FileEncoding {
  const view = new Uint8Array(buffer)
  
  // Check BOM (Byte Order Mark)
  if (view.length >= 3 && view[0] === 0xEF && view[1] === 0xBB && view[2] === 0xBF) {
    return 'UTF-8'
  }
  if (view.length >= 2 && view[0] === 0xFE && view[1] === 0xFF) {
    return 'UTF-16BE'
  }
  if (view.length >= 2 && view[0] === 0xFF && view[1] === 0xFE) {
    return 'UTF-16LE'
  }
  
  // Check for ASCII
  let isAscii = true
  for (let i = 0; i < Math.min(view.length, 1000); i++) {
    if (view[i] > 127) {
      isAscii = false
      break
    }
  }
  if (isAscii) return 'ASCII'
  
  // Default to UTF-8 (most common)
  return 'UTF-8'
}

/**
 * 获取编码的显示名称
 * @param encoding 编码类型
 * @returns 用户友好的显示名称
 */
export function getEncodingDisplayName(encoding: FileEncoding): string {
  const names: Record<FileEncoding, string> = {
    'UTF-8': 'UTF-8',
    'UTF-16LE': 'UTF-16 LE',
    'UTF-16BE': 'UTF-16 BE',
    'ASCII': 'ASCII',
    'ISO-8859-1': 'ISO-8859-1',
    'UNKNOWN': 'Unknown'
  }
  return names[encoding]
}