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
  const crlfCount = (text.match(/\r\n/g) || []).length
  const lfCount = (text.match(/\n/g) || []).length
  const crCount = (text.match(/\r/g) || []).length

  // 计算纯LF和纯CR的数量（排除CRLF中的字符）
  const pureLf = lfCount - crlfCount
  const pureCr = crCount - crlfCount

  if (crlfCount > 0 && pureLf === 0 && pureCr === 0) return 'CRLF'
  if (pureLf > 0 && crlfCount === 0 && pureCr === 0) return 'LF'
  if (pureCr > 0 && crlfCount === 0 && pureLf === 0) return 'CR'
  if (crlfCount > 0 || pureLf > 0 || pureCr > 0) return 'MIXED'
  return 'UNKNOWN'
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