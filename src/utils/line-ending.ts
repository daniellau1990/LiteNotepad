/**
 * 行结束符检测工具函数
 */

export type LineEnding = 'CRLF' | 'LF' | 'CR' | 'MIXED' | 'UNKNOWN'

/**
 * 检测文本中的行结束符类型
 * @param text 要检测的文本内容
 * @returns 行结束符类型
 */
export function detectLineEnding(text: string): LineEnding {
  let crlfCount = 0
  let lfCount = 0
  let crCount = 0
  
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === '\r' && text[i + 1] === '\n') {
      crlfCount++
      i++ // Skip the next character
    } else if (text[i] === '\n') {
      lfCount++
    } else if (text[i] === '\r') {
      crCount++
    }
  }
  
  // Check last character
  if (text.length > 0) {
    const lastChar = text[text.length - 1]
    if (lastChar === '\n') lfCount++
    if (lastChar === '\r') crCount++
  }
  
  const total = crlfCount + lfCount + crCount
  if (total === 0) return 'UNKNOWN'
  
  const counts = { crlf: crlfCount, lf: lfCount, cr: crCount }
  const max = Math.max(crlfCount, lfCount, crCount)
  
  // Check for mixed line endings
  let types = 0
  if (crlfCount > 0) types++
  if (lfCount > 0) types++
  if (crCount > 0) types++
  
  if (types > 1) return 'MIXED'
  
  if (crlfCount === max) return 'CRLF'
  if (lfCount === max) return 'LF'
  return 'CR'
}

/**
 * 获取行结束符的显示名称
 * @param ending 行结束符类型
 * @returns 用户友好的显示名称
 */
export function getLineEndingDisplayName(ending: LineEnding): string {
  const names: Record<LineEnding, string> = {
    'CRLF': 'CRLF',
    'LF': 'LF',
    'CR': 'CR',
    'MIXED': 'Mixed',
    'UNKNOWN': 'Unknown'
  }
  return names[ending]
}