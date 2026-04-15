/**
 * 文件监视钩子
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

export type FileWatchState = 'synced' | 'modified' | 'watching' | 'error'

export interface UseFileWatchOptions {
  pollInterval?: number  // ms between checks if native watching unavailable
  enabled?: boolean     // whether to watch at all
}

export function useFileWatch(
  filePath: string | null,
  content: string,
  options: UseFileWatchOptions = {}
) {
  const {
    pollInterval = 30000, // 30 seconds
    enabled = true
  } = options

  const [state, setState] = useState<FileWatchState>('synced')
  const [lastModified, setLastModified] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const contentRef = useRef(content)
  const filePathRef = useRef(filePath)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check file modification time
  const checkFile = useCallback(async () => {
    if (!filePath) return

    try {
      // 注意：需要先在Tauri后端实现 get_file_modified_time 命令
      const modifiedTime = await invoke<number>('get_file_modified_time', { 
        path: filePath 
      })
      
      if (lastModified === null) {
        setLastModified(modifiedTime)
        setState('watching')
      } else if (modifiedTime > lastModified) {
        setState('modified')
      } else {
        setState('synced')
      }
      
      setError(null)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Watch failed')
    }
  }, [filePath, lastModified])

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = content
    if (state === 'modified') {
      setState('synced')
    }
  }, [content, state])

  // Update file path ref
  useEffect(() => {
    filePathRef.current = filePath
    setLastModified(null)
    setState(filePath ? 'watching' : 'synced')
  }, [filePath])

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !filePath) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    checkFile() // Initial check

    intervalRef.current = setInterval(() => {
      checkFile()
    }, pollInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, filePath, pollInterval, checkFile])

  // Resolve modification (user chose to reload or overwrite)
  const resolveModification = useCallback(async (action: 'reload' | 'overwrite') => {
    if (action === 'reload') {
      // Trigger reload in parent component
      setState('synced')
      return 'reload'
    } else {
      // Mark as synced (user keeps local changes)
      setState('synced')
      await checkFile() // Update last modified time
      return 'overwrite'
    }
  }, [checkFile])

  return {
    state,
    lastModified,
    error,
    resolveModification,
    checkFile
  }
}