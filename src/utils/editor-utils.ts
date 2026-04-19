/**
 * 编辑器相关工具函数
 */

/**
 * 从完整文件路径中提取文件名（跨平台兼容）
 * @param filePath 完整文件路径
 * @returns 文件名或原始路径
 */
export function getFileName(filePath: string | null): string {
  if (!filePath) return 'Untitled'
  
  // 跨平台路径分隔符处理
  const separator = filePath.includes('/') ? '/' : '\\'
  const fileName = filePath.split(separator).pop() || filePath
  
  return fileName
}

/**
 * 格式化光标位置显示
 * @param cursorPosition 光标位置对象
 * @param lineCount 文件总行数（用于默认值）
 * @returns 格式化后的行号和列号
 */
export function formatCursorPosition(
  cursorPosition?: { line: number; column: number },
  lineCount?: number
): { displayLine: number; displayColumn: number } {
  // 默认值：如果没有光标位置，显示最后一行第1列
  const displayLine = cursorPosition?.line ?? (lineCount || 1)
  const displayColumn = cursorPosition?.column ?? 1
  
  return { displayLine, displayColumn }
}

/**
 * 根据文件大小判断是否为大文件模式
 * @param fileSize 文件大小（字节）
 * @returns 是否为大文件（>5MB）
 */
export function isLargeFile(fileSize: number): boolean {
  return fileSize > 5 * 1024 * 1024 // 5MB
}

/**
 * 检测文件编码（简化版，实际应通过文件内容分析）
 * @param fileContent 文件内容
 * @returns 编码类型字符串
 */
export function detectEncoding(fileContent: string): string {
  // 简化实现：实际应该通过BOM标记或字符分布分析
  // 这里返回UTF-8作为默认值
  return 'UTF-8'
}

/**
 * 检测行结束符类型
 * @param fileContent 文件内容
 * @returns 行结束符类型：'LF' | 'CRLF' | 'CR' | 'Mixed'
 */
export function detectLineEndings(fileContent: string): 'LF' | 'CRLF' | 'CR' | 'Mixed' {
  if (!fileContent) return 'LF' // 空内容默认返回LF

  const lfCount = (fileContent.match(/\n/g) || []).length
  const crCount = (fileContent.match(/\r/g) || []).length
  const crlfCount = (fileContent.match(/\r\n/g) || []).length

  // 计算纯LF和纯CR的数量
  const pureLf = lfCount - crlfCount
  const pureCr = crCount - crlfCount

  if (crlfCount > 0 && pureLf === 0 && pureCr === 0) return 'CRLF'
  if (pureLf > 0 && crlfCount === 0 && pureCr === 0) return 'LF'
  if (pureCr > 0 && crlfCount === 0 && pureLf === 0) return 'CR'
  return 'Mixed'
}