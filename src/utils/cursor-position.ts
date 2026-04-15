/**
 * 光标位置工具函数
 */

export interface CursorPosition {
  line: number
  column: number
}

/**
 * 计算光标位置
 * @param doc CodeMirror文档对象
 * @param selectionFrom 选择起始位置
 * @returns 光标位置对象
 */
export function calculateCursorPosition(
  doc: { lineAt: (pos: number) => { number: number; from: number } },
  selectionFrom: number
): CursorPosition {
  const line = doc.lineAt(selectionFrom)
  const column = selectionFrom - line.from + 1
  return { line: line.number, column }
}

/**
 * 格式化光标位置显示
 * @param position 光标位置对象
 * @param template 显示模板（默认：'Ln {line}, Col {column}'）
 * @returns 格式化后的字符串
 */
export function formatCursorPosition(
  position: CursorPosition,
  template: string = 'Ln {line}, Col {column}'
): string {
  return template
    .replace('{line}', position.line.toString())
    .replace('{column}', position.column.toString())
}

/**
 * 验证光标位置（确保在有效范围内）
 * @param position 光标位置对象
 * @param maxLines 最大行数
 * @param maxColumns 最大列数（默认：1000）
 * @returns 验证后的光标位置
 */
export function validateCursorPosition(
  position: CursorPosition,
  maxLines: number,
  maxColumns: number = 1000
): CursorPosition {
  return {
    line: Math.max(1, Math.min(position.line, maxLines)),
    column: Math.max(1, Math.min(position.column, maxColumns))
  }
}