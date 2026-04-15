/**
 * 文件大小相关工具函数
 */

/**
 * 判断文件是否为大文件（>5MB）
 * @param size 文件大小（字节）
 * @returns 是否为大文件
 */
export function isLargeFile(size: number): boolean {
  return size > 5 * 1024 * 1024 // 5MB
}

/**
 * 格式化文件大小显示
 * @param size 文件大小（字节）
 * @returns 格式化后的字符串（如 "1.2 MB"）
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
}

/**
 * 获取文件大小阈值描述
 * @returns 大文件阈值描述
 */
export function getLargeFileThreshold(): { size: number; description: string } {
  return {
    size: 5 * 1024 * 1024,
    description: '5MB'
  }
}