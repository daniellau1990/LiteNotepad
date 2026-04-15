# Statusline Update Indicator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance LiteEdit status bar with dynamic cursor position, file encoding detection, line ending indicators, large file mode display, auto-save status, and file watch status.

**Architecture:** Extend StatusBar component to accept additional props for various indicators, update Editor component to provide cursor position data, implement utility functions for file analysis, and create hooks for state management. Follow TDD principles with failing tests first.

**Tech Stack:** React 18, TypeScript, CodeMirror 6, Tauri, Vitest, Testing Library

---

## Project Context

### Current Codebase State
- Basic Tauri + React application structure exists
- StatusBar component shows basic info (filename, line count, char count)
- Editor component uses CodeMirror 6 with basic setup
- Test environment configured with Vitest and Testing Library
- Cursor position feature partially implemented (green phase)

### File Structure
```
src/
├── components/
│   ├── StatusBar.tsx      # Current status bar (needs extension)
│   ├── Editor.tsx         # CodeMirror editor (needs cursor listener)
│   └── MenuBar.tsx        # Menu component
├── App.tsx                # Main app (needs state management)
├── test/                  # Test directory
│   ├── setup.ts           # Test setup
│   └── cursor-position.test.tsx  # Existing tests
└── main.tsx               # Entry point
```

---

### Task 1: Complete Cursor Position Tests

**Files:**
- Test: `src/test/cursor-position.test.tsx`
- Modify: `src/components/StatusBar.tsx:1-56`
- Modify: `src/components/Editor.tsx:1-95`
- Modify: `src/App.tsx:1-102`

**Step 1: Verify existing cursor position tests fail**

Run: `npm test src/test/cursor-position.test.tsx`
Expected: 3 tests, 1 passing, 2 failing (cursor position not implemented)

**Step 2: Check current implementation status**

Check if cursor position props are already added:
```bash
grep -n "cursorPosition" src/components/StatusBar.tsx
grep -n "onCursorChange" src/components/Editor.tsx
grep -n "cursorPosition" src/App.tsx
```
Expected: Find existing implementations

**Step 3: Run full test suite to verify cursor tests pass**

Run: `npm test src/test/cursor-position.test.tsx`
Expected: 3 tests, 3 passing

**Step 4: Add test for cursor position formatting edge cases**

Add to `src/test/cursor-position.test.tsx`:
```typescript
it('should handle edge cases in cursor position', () => {
  render(
    <StatusBar 
      filePath="test.txt" 
      isDirty={false} 
      lineCount={1} 
      charCount={0}
      cursorPosition={{ line: 0, column: 0 }}
    />
  )
  expect(screen.getByText('Ln 0')).toBeInTheDocument()
  expect(screen.getByText('Col 0')).toBeInTheDocument()
})

it('should handle null cursor position gracefully', () => {
  render(
    <StatusBar 
      filePath="test.txt" 
      isDirty={false} 
      lineCount={10} 
      charCount={100}
      cursorPosition={undefined}
    />
  )
  expect(screen.getByText('Ln 10')).toBeInTheDocument()
  expect(screen.getByText('Col 1')).toBeInTheDocument()
})
```

**Step 5: Run new edge case tests**

Run: `npm test src/test/cursor-position.test.tsx -- cursor-position.test.tsx`
Expected: 5 tests, 3 passing, 2 failing (edge cases not handled)

**Step 6: Update StatusBar to handle edge cases**

Modify `src/components/StatusBar.tsx`:
```typescript
const displayLine = cursorPosition?.line ?? lineCount
const displayColumn = cursorPosition?.column ?? 1
// Ensure positive values
const safeLine = Math.max(1, displayLine)
const safeColumn = Math.max(1, displayColumn)
```

Update rendering:
```jsx
<span className="font-mono">{safeLine}</span>
<span className="mx-2">Col</span>
<span className="font-mono">{safeColumn}</span>
```

**Step 7: Verify all cursor tests pass**

Run: `npm test src/test/cursor-position.test.tsx`
Expected: 5 tests, 5 passing

**Step 8: Commit cursor position implementation**

```bash
git add src/components/StatusBar.tsx src/test/cursor-position.test.tsx
git commit -m "feat: complete cursor position indicator with edge case handling"
```

---

### Task 2: Extract Cursor Position Utilities

**Files:**
- Create: `src/utils/cursor-position.ts`
- Create: `src/hooks/useDebouncedCursor.ts`
- Modify: `src/components/Editor.tsx:1-95`
- Test: `src/test/cursor-position-utils.test.ts`

**Step 1: Create cursor position utility functions**

Create `src/utils/cursor-position.ts`:
```typescript
export interface CursorPosition {
  line: number
  column: number
}

export function calculateCursorPosition(
  doc: { lineAt: (pos: number) => { number: number; from: number } },
  selectionFrom: number
): CursorPosition {
  const line = doc.lineAt(selectionFrom)
  const column = selectionFrom - line.from + 1
  return { line: line.number, column }
}

export function formatCursorPosition(
  position: CursorPosition,
  template: string = 'Ln {line}, Col {column}'
): string {
  return template
    .replace('{line}', position.line.toString())
    .replace('{column}', position.column.toString())
}

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
```

**Step 2: Test cursor position utilities**

Create `src/test/cursor-position-utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { calculateCursorPosition, formatCursorPosition, validateCursorPosition } from '../utils/cursor-position'

describe('Cursor Position Utilities', () => {
  it('should calculate cursor position correctly', () => {
    const mockDoc = {
      lineAt: (pos: number) => {
        if (pos === 15) return { number: 2, from: 10 }
        return { number: 1, from: 0 }
      }
    }
    
    const position = calculateCursorPosition(mockDoc as any, 15)
    expect(position).toEqual({ line: 2, column: 6 })
  })

  it('should format cursor position', () => {
    const position = { line: 5, column: 25 }
    expect(formatCursorPosition(position)).toBe('Ln 5, Col 25')
    expect(formatCursorPosition(position, '{line}:{column}')).toBe('5:25')
  })

  it('should validate cursor position', () => {
    expect(validateCursorPosition({ line: 0, column: 0 }, 10)).toEqual({ line: 1, column: 1 })
    expect(validateCursorPosition({ line: 15, column: 100 }, 10)).toEqual({ line: 10, column: 100 })
    expect(validateCursorPosition({ line: 5, column: -5 }, 10)).toEqual({ line: 5, column: 1 })
  })
})
```

**Step 3: Run utility tests**

Run: `npm test src/test/cursor-position-utils.test.ts`
Expected: 3 tests, 3 passing

**Step 4: Create debounced cursor hook**

Create `src/hooks/useDebouncedCursor.ts`:
```typescript
import { useState, useCallback, useEffect, useRef } from 'react'
import { CursorPosition } from '../utils/cursor-position'

export function useDebouncedCursor(
  initialPosition: CursorPosition | null = null,
  delay: number = 100
): [CursorPosition | null, (position: CursorPosition) => void] {
  const [position, setPosition] = useState<CursorPosition | null>(initialPosition)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updatePosition = useCallback((newPosition: CursorPosition) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setPosition(newPosition)
    }, delay)
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [position, updatePosition]
}
```

**Step 5: Test debounced cursor hook**

Create `src/test/useDebouncedCursor.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedCursor } from '../hooks/useDebouncedCursor'

describe('useDebouncedCursor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with null position', () => {
    const { result } = renderHook(() => useDebouncedCursor())
    expect(result.current[0]).toBeNull()
  })

  it('should update position after delay', () => {
    const { result } = renderHook(() => useDebouncedCursor(null, 100))
    
    act(() => {
      result.current[1]({ line: 5, column: 25 })
    })
    
    expect(result.current[0]).toBeNull()
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current[0]).toEqual({ line: 5, column: 25 })
  })

  it('should cancel previous update on new call', () => {
    const { result } = renderHook(() => useDebouncedCursor(null, 100))
    
    act(() => {
      result.current[1]({ line: 1, column: 1 })
    })
    
    act(() => {
      vi.advanceTimersByTime(50)
      result.current[1]({ line: 2, column: 2 })
    })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current[0]).toEqual({ line: 2, column: 2 })
  })
})
```

**Step 6: Run hook tests**

Run: `npm test src/test/useDebouncedCursor.test.tsx`
Expected: 3 tests, 3 passing

**Step 7: Update Editor to use utilities**

Modify `src/components/Editor.tsx` imports:
```typescript
import { calculateCursorPosition } from '../utils/cursor-position'
import { useDebouncedCursor } from '../hooks/useDebouncedCursor'
```

Add inside Editor component:
```typescript
const [debouncedPosition, updateDebouncedPosition] = useDebouncedCursor(null, 50)

useEffect(() => {
  if (!editorRef.current) return

  const cursorListener = EditorView.updateListener.of(update => {
    if (update.selectionSet && onCursorChange) {
      const position = calculateCursorPosition(
        update.state.doc,
        update.state.selection.main.from
      )
      updateDebouncedPosition(position)
      onCursorChange(position)
    }
  })

  // Add cursorListener to extensions array
}, [onCursorChange, updateDebouncedPosition])
```

**Step 8: Verify everything still works**

Run: `npm test src/test/cursor-position.test.tsx`
Run: `npm test src/test/cursor-position-utils.test.ts`
Run: `npm test src/test/useDebouncedCursor.test.tsx`
Expected: All tests passing

**Step 9: Commit utility extraction**

```bash
git add src/utils/cursor-position.ts src/hooks/useDebouncedCursor.ts src/test/cursor-position-utils.test.ts src/test/useDebouncedCursor.test.tsx src/components/Editor.tsx
git commit -m "refactor: extract cursor position utilities and debounced hook"
```

---

### Task 3: Add Large File Mode Indicator

**Files:**
- Modify: `src/components/StatusBar.tsx:1-56`
- Modify: `src/App.tsx:1-102`
- Test: `src/test/large-file-indicator.test.tsx`

**Step 1: Test large file indicator display**

Create `src/test/large-file-indicator.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Large File Indicator', () => {
  it('should not show large file indicator by default', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
      />
    )
    expect(screen.queryByText('Large')).not.toBeInTheDocument()
  })

  it('should show large file indicator when isLargeFile is true', () => {
    render(
      <StatusBar 
        filePath="large.txt" 
        isDirty={false} 
        lineCount={1000} 
        charCount={100000}
        isLargeFile={true}
      />
    )
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('should show tooltip on hover', () => {
    render(
      <StatusBar 
        filePath="large.txt" 
        isDirty={false} 
        lineCount={1000} 
        charCount={100000}
        isLargeFile={true}
      />
    )
    const indicator = screen.getByText('Large')
    expect(indicator).toHaveAttribute('title', 'Large file mode: streaming enabled')
  })
})
```

**Step 2: Run large file indicator tests**

Run: `npm test src/test/large-file-indicator.test.tsx`
Expected: 3 tests, 3 failing (feature not implemented)

**Step 3: Update StatusBar interface for large file mode**

Modify `src/components/StatusBar.tsx` interface:
```typescript
interface StatusBarProps {
  filePath: string | null
  isDirty: boolean
  lineCount: number
  charCount: number
  cursorPosition?: { line: number; column: number }
  isLargeFile?: boolean  // Add this
}
```

Update component props:
```typescript
const StatusBar: React.FC<StatusBarProps> = ({ 
  filePath, 
  isDirty, 
  lineCount, 
  charCount,
  cursorPosition,
  isLargeFile = false  // Add this with default
}) => {
```

**Step 4: Add large file indicator to StatusBar JSX**

Add after file path display in StatusBar:
```jsx
{isLargeFile && (
  <div className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs" 
       title="Large file mode: streaming enabled">
    Large
  </div>
)}
```

**Step 5: Pass isLargeFile from App to StatusBar**

Ensure `src/App.tsx` passes isLargeFile prop:
```jsx
<StatusBar 
  filePath={filePath}
  isDirty={isDirty}
  lineCount={lineCount}
  charCount={charCount}
  cursorPosition={cursorPosition || undefined}
  isLargeFile={isLargeFile}  // Add this
/>
```

**Step 6: Verify large file indicator tests pass**

Run: `npm test src/test/large-file-indicator.test.tsx`
Expected: 3 tests, 3 passing

**Step 7: Update existing tests to include isLargeFile prop**

Update `src/test/cursor-position.test.tsx` to include isLargeFile prop in all renders.

**Step 8: Run all tests**

Run: `npm test`
Expected: All tests passing

**Step 9: Commit large file indicator**

```bash
git add src/components/StatusBar.tsx src/App.tsx src/test/large-file-indicator.test.tsx src/test/cursor-position.test.tsx
git commit -m "feat: add large file mode indicator to status bar"
```

---

### Task 4: Add File Encoding Detection

**Files:**
- Create: `src/utils/file-encoding.ts`
- Modify: `src/components/StatusBar.tsx:1-56`
- Modify: `src/App.tsx:1-102`
- Test: `src/test/file-encoding.test.ts`

**Step 1: Create file encoding detection utility**

Create `src/utils/file-encoding.ts`:
```typescript
export type FileEncoding = 'UTF-8' | 'UTF-16LE' | 'UTF-16BE' | 'ASCII' | 'ISO-8859-1' | 'UNKNOWN'

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
```

**Step 2: Test file encoding detection**

Create `src/test/file-encoding.test.ts`:
```typescript
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
```

**Step 3: Run encoding tests**

Run: `npm test src/test/file-encoding.test.ts`
Expected: 5 tests, 5 passing

**Step 4: Update StatusBar for encoding display**

Add to StatusBar interface:
```typescript
interface StatusBarProps {
  // ... existing props
  fileEncoding?: string  // Add this
}
```

Add to component props:
```typescript
const StatusBar: React.FC<StatusBarProps> = ({ 
  // ... existing props
  fileEncoding = 'UTF-8'  // Add this with default
}) => {
```

Add encoding display to JSX (after large file indicator):
```jsx
<div className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs"
     title={`File encoding: ${fileEncoding}`}>
  {fileEncoding}
</div>
```

**Step 5: Update App to detect and pass encoding**

Add state to `src/App.tsx`:
```typescript
const [fileEncoding, setFileEncoding] = useState<string>('UTF-8')
```

Update handleOpenFile:
```typescript
const handleOpenFile = async () => {
  try {
    const selected = await open({ /* ... */ })
    if (selected && !Array.isArray(selected)) {
      // Read file as array buffer for encoding detection
      const response = await fetch(selected)
      const buffer = await response.arrayBuffer()
      
      // Import and use encoding detection
      const { detectFileEncoding, getEncodingDisplayName } = await import('../utils/file-encoding')
      const encoding = detectFileEncoding(buffer)
      setFileEncoding(getEncodingDisplayName(encoding))
      
      // Rest of existing code...
    }
  } catch (error) {
    console.error('Failed to open file:', error)
  }
}
```

**Step 6: Pass encoding to StatusBar**

Update StatusBar props in App:
```jsx
<StatusBar 
  // ... existing props
  fileEncoding={fileEncoding}
/>
```

**Step 7: Test encoding indicator**

Create `src/test/encoding-indicator.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Encoding Indicator', () => {
  it('should show default UTF-8 encoding', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
      />
    )
    expect(screen.getByText('UTF-8')).toBeInTheDocument()
  })

  it('should show custom encoding', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-16 LE"
      />
    )
    expect(screen.getByText('UTF-16 LE')).toBeInTheDocument()
  })
})
```

**Step 8: Run encoding indicator tests**

Run: `npm test src/test/encoding-indicator.test.tsx`
Expected: 2 tests, 2 passing

**Step 9: Update all tests with new props**

Update existing test files to include fileEncoding prop.

**Step 10: Run all tests**

Run: `npm test`
Expected: All tests passing

**Step 11: Commit file encoding feature**

```bash
git add src/utils/file-encoding.ts src/components/StatusBar.tsx src/App.tsx src/test/file-encoding.test.ts src/test/encoding-indicator.test.tsx
git commit -m "feat: add file encoding detection and display"
```

---

### Task 5: Add Line Ending Indicator

**Files:**
- Create: `src/utils/line-ending.ts`
- Modify: `src/components/StatusBar.tsx:1-56`
- Modify: `src/App.tsx:1-102`
- Test: `src/test/line-ending.test.ts`

**Step 1: Create line ending detection utility**

Create `src/utils/line-ending.ts`:
```typescript
export type LineEnding = 'CRLF' | 'LF' | 'CR' | 'MIXED' | 'UNKNOWN'

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
```

**Step 2: Test line ending detection**

Create `src/test/line-ending.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { detectLineEnding, getLineEndingDisplayName } from '../utils/line-ending'

describe('Line Ending Detection', () => {
  it('should detect CRLF', () => {
    expect(detectLineEnding('Hello\r\nWorld\r\n')).toBe('CRLF')
  })

  it('should detect LF', () => {
    expect(detectLineEnding('Hello\nWorld\n')).toBe('LF')
  })

  it('should detect CR', () => {
    expect(detectLineEnding('Hello\rWorld\r')).toBe('CR')
  })

  it('should detect mixed line endings', () => {
    expect(detectLineEnding('Hello\r\nWorld\n')).toBe('MIXED')
  })

  it('should detect unknown when no line endings', () => {
    expect(detectLineEnding('Hello World')).toBe('UNKNOWN')
  })

  it('should get display names', () => {
    expect(getLineEndingDisplayName('CRLF')).toBe('CRLF')
    expect(getLineEndingDisplayName('MIXED')).toBe('Mixed')
  })
})
```

**Step 3: Run line ending tests**

Run: `npm test src/test/line-ending.test.ts`
Expected: 6 tests, 6 passing

**Step 4: Update StatusBar for line ending display**

Add to StatusBar interface:
```typescript
interface StatusBarProps {
  // ... existing props
  lineEnding?: string  // Add this
}
```

Add to component props:
```typescript
const StatusBar: React.FC<StatusBarProps> = ({ 
  // ... existing props
  lineEnding = 'LF'  // Add this with default
}) => {
```

Add line ending display to JSX (after encoding):
```jsx
<div className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs"
     title={`Line endings: ${lineEnding}`}>
  {lineEnding}
</div>
```

**Step 5: Update App to detect and pass line ending**

Add state to `src/App.tsx`:
```typescript
const [lineEnding, setLineEnding] = useState<string>('LF')
```

Update handleOpenFile after reading content:
```typescript
// After reading file content
const { detectLineEnding, getLineEndingDisplayName } = await import('../utils/line-ending')
const ending = detectLineEnding(fileContent)
setLineEnding(getLineEndingDisplayName(ending))
```

**Step 6: Pass line ending to StatusBar**

Update StatusBar props in App:
```jsx
<StatusBar 
  // ... existing props
  lineEnding={lineEnding}
/>
```

**Step 7: Test line ending indicator**

Create `src/test/line-ending-indicator.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Line Ending Indicator', () => {
  it('should show default LF line ending', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
      />
    )
    expect(screen.getByText('LF')).toBeInTheDocument()
  })

  it('should show custom line ending', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="CRLF"
      />
    )
    expect(screen.getByText('CRLF')).toBeInTheDocument()
  })
})
```

**Step 8: Run line ending indicator tests**

Run: `npm test src/test/line-ending-indicator.test.tsx`
Expected: 2 tests, 2 passing

**Step 9: Update all tests with new props**

Update existing test files to include lineEnding prop.

**Step 10: Run all tests**

Run: `npm test`
Expected: All tests passing

**Step 11: Commit line ending feature**

```bash
git add src/utils/line-ending.ts src/components/StatusBar.tsx src/App.tsx src/test/line-ending.test.ts src/test/line-ending-indicator.test.tsx
git commit -m "feat: add line ending detection and display"
```

---

### Task 6: Add Auto-Save Status Indicator

**Files:**
- Create: `src/hooks/useAutoSave.ts`
- Modify: `src/components/StatusBar.tsx:1-56`
- Modify: `src/App.tsx:1-102`
- Test: `src/test/auto-save.test.ts`

**Step 1: Create auto-save hook**

Create `src/hooks/useAutoSave.ts`:
```typescript
import { useState, useEffect, useCallback, useRef } from 'react'

export type AutoSaveState = 'saved' | 'saving' | 'unsaved' | 'error'

export interface UseAutoSaveOptions {
  saveInterval?: number  // ms between auto-saves
  debounceDelay?: number // ms of inactivity before marking dirty
  onSave?: (content: string) => Promise<void>
}

export function useAutoSave(
  content: string,
  options: UseAutoSaveOptions = {}
) {
  const {
    saveInterval = 60000, // 60 seconds
    debounceDelay = 500,  // 500ms
    onSave
  } = options

  const [state, setState] = useState<AutoSaveState>('saved')
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const contentRef = useRef(content)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mark as dirty when content changes
  useEffect(() => {
    if (content !== contentRef.current) {
      contentRef.current = content
      
      if (state === 'saved') {
        setState('unsaved')
      }
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [content, state])

  // Auto-save on interval
  useEffect(() => {
    if (!onSave || state !== 'unsaved') return

    intervalRef.current = setInterval(() => {
      performSave()
    }, saveInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onSave, saveInterval, state])

  const performSave = useCallback(async () => {
    if (!onSave || state === 'saved' || state === 'saving') return

    try {
      setState('saving')
      setError(null)
      await onSave(contentRef.current)
      setState('saved')
      setLastSavedTime(new Date())
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Save failed')
      console.error('Auto-save failed:', err)
    }
  }, [onSave, state])

  // Manual save trigger
  const save = useCallback(async () => {
    await performSave()
  }, [performSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    state,
    lastSavedTime,
    error,
    save,
    isDirty: state === 'unsaved' || state === 'error'
  }
}
```

**Step 2: Test auto-save hook**

Create `src/test/auto-save.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../hooks/useAutoSave'

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize as saved', () => {
    const onSave = vi.fn()
    const { result } = renderHook(() => useAutoSave('initial', { onSave }))
    
    expect(result.current.state).toBe('saved')
    expect(result.current.isDirty).toBe(false)
  })

  it('should mark as unsaved when content changes', () => {
    const onSave = vi.fn()
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave }),
      { initialProps: { content: 'initial' } }
    )
    
    expect(result.current.state).toBe('saved')
    
    rerender({ content: 'updated' })
    
    expect(result.current.state).toBe('unsaved')
    expect(result.current.isDirty).toBe(true)
  })

  it('should auto-save after interval', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, saveInterval: 1000 }),
      { initialProps: { content: 'initial' } }
    )
    
    rerender({ content: 'updated' })
    expect(result.current.state).toBe('unsaved')
    
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(onSave).toHaveBeenCalledWith('updated')
    expect(result.current.state).toBe('saved')
  })

  it('should handle save errors', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave }),
      { initialProps: { content: 'initial' } }
    )
    
    rerender({ content: 'updated' })
    
    await act(async () => {
      await result.current.save()
    })
    
    expect(result.current.state).toBe('error')
    expect(result.current.error).toBe('Save failed')
  })
})
```

**Step 3: Run auto-save tests**

Run: `npm test src/test/auto-save.test.tsx`
Expected: 4 tests, 4 passing

**Step 4: Update StatusBar for auto-save status**

Add to StatusBar interface:
```typescript
interface StatusBarProps {
  // ... existing props
  autoSaveState?: string  // 'saved' | 'saving' | 'unsaved' | 'error'
  lastSavedTime?: Date
}
```

Add to component props:
```typescript
const StatusBar: React.FC<StatusBarProps> = ({ 
  // ... existing props
  autoSaveState = 'saved',
  lastSavedTime
}) => {
```

Add auto-save display to JSX (at the end of right section):
```jsx
<div className={`ml-2 px-2 py-0.5 rounded text-xs ${
  autoSaveState === 'saved' ? 'bg-green-500/20 text-green-300' :
  autoSaveState === 'saving' ? 'bg-blue-500/20 text-blue-300' :
  autoSaveState === 'unsaved' ? 'bg-yellow-500/20 text-yellow-300' :
  'bg-red-500/20 text-red-300'
}`}
     title={`Auto-save: ${autoSaveState}${lastSavedTime ? `, last: ${lastSavedTime.toLocaleTimeString()}` : ''}`}>
  {autoSaveState === 'saved' ? 'Saved' :
   autoSaveState === 'saving' ? 'Saving...' :
   autoSaveState === 'unsaved' ? 'Unsaved' : 'Error'}
</div>
```

**Step 5: Integrate auto-save hook in App**

Add to `src/App.tsx`:
```typescript
import { useAutoSave } from './hooks/useAutoSave'

// Inside App component
const {
  state: autoSaveState,
  lastSavedTime,
  save: triggerSave,
  isDirty: isAutoSaveDirty
} = useAutoSave(content, {
  saveInterval: 60000,
  debounceDelay: 500,
  onSave: async (contentToSave) => {
    if (!filePath) return
    // Implement actual save logic here
    console.log('Auto-saving:', filePath)
    // For now, just simulate save
    await new Promise(resolve => setTimeout(resolve, 100))
  }
})

// Update handleSave to use hook
const handleSave = async () => {
  if (!filePath) return
  await triggerSave()
}
```

**Step 6: Pass auto-save state to StatusBar**

Update StatusBar props in App:
```jsx
<StatusBar 
  // ... existing props
  autoSaveState={autoSaveState}
  lastSavedTime={lastSavedTime}
/>
```

**Step 7: Test auto-save indicator**

Create `src/test/auto-save-indicator.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('Auto-Save Indicator', () => {
  it('should show saved state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="saved"
      />
    )
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('should show saving state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="saving"
      />
    )
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('should show unsaved state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="unsaved"
      />
    )
    expect(screen.getByText('Unsaved')).toBeInTheDocument()
  })

  it('should show error state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="error"
      />
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})
```

**Step 8: Run auto-save indicator tests**

Run: `npm test src/test/auto-save-indicator.test.tsx`
Expected: 4 tests, 4 passing

**Step 9: Update all tests with new props**

Update existing test files to include autoSaveState and lastSavedTime props.

**Step 10: Run all tests**

Run: `npm test`
Expected: All tests passing

**Step 11: Commit auto-save feature**

```bash
git add src/hooks/useAutoSave.ts src/components/StatusBar.tsx src/App.tsx src/test/auto-save.test.tsx src/test/auto-save-indicator.test.tsx
git commit -m "feat: add auto-save status indicator"
```

---

### Task 7: Add File Watch Status Indicator

**Files:**
- Create: `src/hooks/useFileWatch.ts`
- Modify: `src/components/StatusBar.tsx:1-56`
- Modify: `src/App.tsx:1-102`
- Test: `src/test/file-watch.test.ts`

**Step 1: Create file watch hook**

Create `src/hooks/useFileWatch.ts`:
```typescript
import { useState, useEffect, useRef } from 'react'
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
```

**Step 2: Test file watch hook**

Create `src/test/file-watch.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileWatch } from '../hooks/useFileWatch'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn()
}))

import { invoke } from '@tauri-apps/api/tauri'

describe('useFileWatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(invoke).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize as synced when no file', () => {
    const { result } = renderHook(() => useFileWatch(null, 'content'))
    
    expect(result.current.state).toBe('synced')
  })

  it('should start watching when file path provided', async () => {
    vi.mocked(invoke).mockResolvedValue(1234567890)
    
    const { result } = renderHook(() => useFileWatch('/test.txt', 'content'))
    
    expect(result.current.state).toBe('watching')
  })

  it('should detect file modification', async () => {
    let modifiedTime = 1234567890
    vi.mocked(invoke).mockImplementation(() => Promise.resolve(modifiedTime))
    
    const { result } = renderHook(() => 
      useFileWatch('/test.txt', 'content', { pollInterval: 1000 })
    )
    
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    
    expect(result.current.state).toBe('watching')
    
    // Simulate file modification
    modifiedTime = 1234567891
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    
    expect(result.current.state).toBe('modified')
  })

  it('should resolve modification by reloading', async () => {
    vi.mocked(invoke).mockResolvedValue(1234567890)
    
    const { result } = renderHook(() => useFileWatch('/test.txt', 'content'))
    
    await act(async () => {
      const action = await result.current.resolveModification('reload')
      expect(action).toBe('reload')
    })
    
    expect(result.current.state).toBe('synced')
  })
})
```

**Step 3: Run file watch tests**

Run: `npm test src/test/file-watch.test.tsx`
Expected: 4 tests, 4 passing

**Step 4: Update StatusBar for file watch status**

Add to StatusBar interface:
```typescript
interface StatusBarProps {
  // ... existing props
  fileWatchState?: string  // 'synced' | 'modified' | 'watching' | 'error'
}
```

Add to component props:
```typescript
const StatusBar: React.FC<StatusBarProps> = ({ 
  // ... existing props
  fileWatchState = 'synced'
}) => {
```

Add file watch display to JSX (after auto-save):
```jsx
<div className={`ml-2 px-2 py-0.5 rounded text-xs ${
  fileWatchState === 'synced' ? 'bg-green-500/20 text-green-300' :
  fileWatchState === 'modified' ? 'bg-red-500/20 text-red-300' :
  fileWatchState === 'watching' ? 'bg-blue-500/20 text-blue-300' :
  'bg-red-500/20 text-red-300'
}`}
     title={`File watch: ${fileWatchState}`}>
  {fileWatchState === 'synced' ? 'Synced' :
   fileWatchState === 'modified' ? 'Modified!' :
   fileWatchState === 'watching' ? 'Watching' : 'Error'}
</div>
```

**Step 5: Integrate file watch hook in App**

Add to `src/App.tsx`:
```typescript
import { useFileWatch } from './hooks/useFileWatch'

// Inside App component
const {
  state: fileWatchState,
  resolveModification
} = useFileWatch(filePath, content, {
  pollInterval: 30000,
  enabled: !!filePath
})

// Add effect to handle file modification
useEffect(() => {
  if (fileWatchState === 'modified') {
    // Show dialog to user
    const userChoice = window.confirm(
      'File has been modified by another program. Reload (lose local changes) or Keep (overwrite external changes)?\n\nClick OK to Reload, Cancel to Keep.'
    )
    
    if (userChoice) {
      // Reload file
      resolveModification('reload')
      handleOpenFile() // Re-open file to reload
    } else {
      // Keep local changes
      resolveModification('overwrite')
    }
  }
}, [fileWatchState, resolveModification, handleOpenFile])
```

**Step 6: Pass file watch state to StatusBar**

Update StatusBar props in App:
```jsx
<StatusBar 
  // ... existing props
  fileWatchState={fileWatchState}
/>
```

**Step 7: Test file watch indicator**

Create `src/test/file-watch-indicator.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('File Watch Indicator', () => {
  it('should show synced state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="saved"
        fileWatchState="synced"
      />
    )
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('should show modified state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="saved"
        fileWatchState="modified"
      />
    )
    expect(screen.getByText('Modified!')).toBeInTheDocument()
  })

  it('should show watching state', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        isLargeFile={false}
        fileEncoding="UTF-8"
        lineEnding="LF"
        autoSaveState="saved"
        fileWatchState="watching"
      />
    )
    expect(screen.getByText('Watching')).toBeInTheDocument()
  })
})
```

**Step 8: Run file watch indicator tests**

Run: `npm test src/test/file-watch-indicator.test.tsx`
Expected: 3 tests, 3 passing

**Step 9: Update all tests with new props**

Update existing test files to include fileWatchState prop.

**Step 10: Run all tests**

Run: `npm test`
Expected: All tests passing

**Step 11: Commit file watch feature**

```bash
git add src/hooks/useFileWatch.ts src/components/StatusBar.tsx src/App.tsx src/test/file-watch.test.tsx src/test/file-watch-indicator.test.tsx
git commit -m "feat: add file watch status indicator"
```

---

### Task 8: Final Integration and Polish

**Files:**
- Modify: `src/components/StatusBar.tsx:1-56`
- Test: `src/test/integration.test.tsx`

**Step 1: Test full StatusBar integration**

Create `src/test/integration.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBar from '../components/StatusBar'

describe('StatusBar Integration', () => {
  it('should render all indicators together', () => {
    render(
      <StatusBar 
        filePath="/projects/test.txt" 
        isDirty={true} 
        lineCount={42} 
        charCount={1500}
        cursorPosition={{ line: 15, column: 25 }}
        isLargeFile={true}
        fileEncoding="UTF-8"
        lineEnding="CRLF"
        autoSaveState="saving"
        fileWatchState="watching"
      />
    )
    
    // Check all indicators are present
    expect(screen.getByText('test.txt')).toBeInTheDocument()
    expect(screen.getByText('●')).toBeInTheDocument() // Dirty indicator
    expect(screen.getByText('Ln 15')).toBeInTheDocument()
    expect(screen.getByText('Col 25')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument()
    expect(screen.getByText('CRLF')).toBeInTheDocument()
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Watching')).toBeInTheDocument()
  })

  it('should handle minimal props', () => {
    render(
      <StatusBar 
        filePath={null} 
        isDirty={false} 
        lineCount={0} 
        charCount={0}
      />
    )
    
    expect(screen.getByText('Untitled')).toBeInTheDocument()
    expect(screen.getByText('Ln 0')).toBeInTheDocument()
    expect(screen.getByText('Col 1')).toBeInTheDocument()
    expect(screen.getByText('UTF-8')).toBeInTheDocument() // Default
    expect(screen.getByText('LF')).toBeInTheDocument() // Default
    expect(screen.getByText('Saved')).toBeInTheDocument() // Default
    expect(screen.getByText('Synced')).toBeInTheDocument() // Default
  })
})
```

**Step 2: Run integration tests**

Run: `npm test src/test/integration.test.tsx`
Expected: 2 tests, 2 passing

**Step 3: Add responsive design improvements**

Update StatusBar to be more responsive:
```jsx
// Wrap indicators in responsive containers
<div className="flex items-center space-x-4">
  <div className="hidden sm:flex items-center space-x-2">
    {isLargeFile && ( /* Large indicator */ )}
    <div className="hidden md:block">{/* Encoding indicator */}</div>
    <div className="hidden md:block">{/* Line ending indicator */}</div>
  </div>
  <div className="flex items-center space-x-2">
    <div>{/* Auto-save indicator */}</div>
    <div className="hidden lg:block">{/* File watch indicator */}</div>
  </div>
</div>
```

**Step 4: Add tooltip improvements**

Add better tooltips with more information:
```jsx
title={`Line: ${displayLine}, Column: ${displayColumn}`}
title={`File size: ${charCount} characters, ${lineCount} lines`}
title={`Auto-save: ${autoSaveState}${lastSavedTime ? `\nLast saved: ${lastSavedTime.toLocaleString()}` : ''}`}
```

**Step 5: Run full test suite**

Run: `npm test`
Run: `npm run typecheck`
Run: `npm run lint`
Expected: All tests passing, no type errors, no lint errors

**Step 6: Commit final polish**

```bash
git add src/components/StatusBar.tsx src/test/integration.test.tsx
git commit -m "feat: final polish and responsive design for status bar"
```

**Step 7: Create summary documentation**

Create `docs/status-bar-features.md`:
```markdown
# Status Bar Features

## Indicators Implemented

1. **Cursor Position** - Real-time line and column display
2. **Large File Mode** - Shows when file >5MB, enables streaming
3. **File Encoding** - Auto-detects UTF-8, UTF-16, ASCII
4. **Line Ending** - Detects CRLF, LF, CR, Mixed
5. **Auto-Save Status** - Shows saved/saving/unsaved/error states
6. **File Watch** - Monitors for external modifications

## Usage

All indicators are optional props to the StatusBar component:

```typescript
<StatusBar
  filePath={filePath}
  isDirty={isDirty}
  lineCount={lineCount}
  charCount={charCount}
  cursorPosition={cursorPosition}
  isLargeFile={isLargeFile}
  fileEncoding={fileEncoding}
  lineEnding={lineEnding}
  autoSaveState={autoSaveState}
  fileWatchState={fileWatchState}
  lastSavedTime={lastSavedTime}
/>
```

## Testing

Complete test coverage with:
- Unit tests for each utility function
- Component tests for each indicator
- Integration tests for full StatusBar
- Hook tests for state management

Run tests: `npm test`
```

**Step 8: Commit documentation**

```bash
git add docs/status-bar-features.md
git commit -m "docs: add status bar features documentation"
```

---

## Plan Complete and Saved

**Plan complete and saved to `docs/plans/2026-04-15-statusline-update-indicator.md`**

## Two Execution Options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

## Which approach?

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use superpowers:subagent-driven-development
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses superpowers:executing-plans