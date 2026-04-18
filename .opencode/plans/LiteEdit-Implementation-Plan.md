# LiteEdit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical bugs and implement menu functions + Markdown formatting toolbar

**Architecture:**
- Tauri + React + CodeMirror 6 architecture remains unchanged
- Fix 3 bugs in v0.1.2, implement features in v0.2.0
- StatusBar simplified to 3 core indicators

**Tech Stack:** TypeScript, React, CodeMirror 6, Tauri, Tailwind CSS

---

## Phase 1: v0.1.2 Bug Fixes

### Task 1: Fix handleOpenFile Definition Order Bug

**Files:**
- Modify: `src/App.tsx:69-85`

**Step 1: Identify the bug**

The useEffect at lines 69-85 references `handleOpenFile` on line 79, but the function is defined at line 95. This causes a ReferenceError.

**Step 2: Fix by reordering**

Move `handleOpenFile` function definition before the useEffect at line 69, or use `useCallback`.

**Step 3: Verify the fix**

Run: `npm run typecheck`
Expected: No ReferenceError related to handleOpenFile

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "fix: resolve handleOpenFile definition order bug"
```

---

### Task 2: Implement Window Close Save

**Files:**
- Modify: `src/App.tsx:160-170`

**Step 1: Update close handler to actually save**

Current code prevents close but doesn't save:
```typescript
useEffect(() => {
  const unsubscribe = appWindow.onCloseRequested(async (event) => {
    if (isDirty) {
      event.preventDefault()
    }
  })
}, [isDirty])
```

Update to:
```typescript
useEffect(() => {
  const unsubscribe = appWindow.onCloseRequested(async (event) => {
    if (isDirty) {
      event.preventDefault()
      const userChoice = window.confirm(
        '有未保存的更改。保存后关闭？\n\n点击"确定"保存，"取消"放弃更改。'
      )
      if (userChoice) {
        await triggerSave()
        setIsDirty(false)
      }
      await appWindow.close()
    }
  })
  return () => { unsubscribe.then(fn => fn()) }
}, [isDirty, filePath, triggerSave])
```

**Step 2: Test the close handler**

Manual test: Modify content, close window, verify save dialog appears

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "fix: implement save on window close"
```

---

### Task 3: Fix Save As Path

**Files:**
- Modify: `src/App.tsx:155-158` (handleSave)
- Modify: `src/components/MenuBar.tsx:10-26` (handleSaveAs)

**Step 1: Update MenuBar props**

Update `MenuBarProps` interface to accept optional path parameter:
```typescript
interface MenuBarProps {
  onOpen: () => void
  onSave: (path?: string) => void  // path is optional, used for Save As
}
```

**Step 2: Fix handleSaveAs to pass path**

```typescript
const handleSaveAs = async () => {
  try {
    const filePath = await save({
      filters: [{
        name: 'Text Files',
        extensions: ['txt', 'md', 'js', 'json', 'ts', 'tsx', 'html', 'css']
      }]
    })
    if (filePath) {
      onSave(filePath)  // Pass new path
    }
  } catch (error) {
    console.error('Failed to save file:', error)
  }
}
```

**Step 3: Update handleSave in App.tsx to use path**

```typescript
const handleSave = async (path?: string) => {
  const savePath = path || filePath
  if (!savePath) return

  // If Save As with new path, update filePath first
  if (path && path !== filePath) {
    setFilePath(path)
  }

  await triggerSave()
}
```

**Step 4: Commit**

```bash
git add src/App.tsx src/components/MenuBar.tsx
git commit -m "fix: Save As passes new path correctly"
```

---

## Phase 2: v0.2.0 Menu Functions

### Task 4: Implement Edit Menu Functions

**Files:**
- Modify: `src/components/MenuBar.tsx`

**Step 1: Add EditorRef for text operations**

First, we need to expose the CodeMirror editor instance. Modify `Editor.tsx` to accept a `viewRef` prop:
```typescript
interface EditorProps {
  // ... existing props
  viewRef?: React.MutableRefObject<EditorView | null>
}
```

Add at end of Editor component:
```typescript
if (viewRef) {
  viewRef.current = view
}
```

**Step 2: Update App.tsx to pass viewRef**

```typescript
const editorViewRef = useRef<EditorView | null>(null)

// Pass to Editor
<Editor viewRef={editorViewRef} ... />
```

**Step 3: Implement Edit menu click handlers**

Add to MenuBar:
```typescript
const handleUndo = () => {
  if (editorViewRef.current) {
    editorViewRef.current.dispatch({ undo: true })
  }
}

const handleRedo = () => {
  if (editorViewRef.current) {
    editorViewRef.current.dispatch({ redo: true })
  }
}

const handleCut = () => {
  document.execCommand('cut')
}

const handleCopy = () => {
  document.execCommand('copy')
}

const handlePaste = () => {
  document.execCommand('paste')
}

const handleSelectAll = () => {
  if (editorViewRef.current) {
    const doc = editorViewRef.current.state.doc
    editorViewRef.current.dispatch({
      selection: { anchor: 0, head: doc.length }
    })
  }
}
```

**Step 4: Wire up menu buttons**

```jsx
<button onClick={handleUndo} className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t">
  Undo
</button>
<button onClick={handleRedo} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
  Redo
</button>
```

**Step 5: Add keyboard shortcuts**

Add to `App.tsx` or create a `useKeyboardShortcuts` hook:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'z') handleUndo()
    if (e.ctrlKey && e.key === 'y') handleRedo()
    if (e.ctrlKey && e.key === 'x') handleCut()
    if (e.ctrlKey && e.key === 'c') handleCopy()
    if (e.ctrlKey && e.key === 'v') handlePaste()
    if (e.ctrlKey && e.key === 'a') handleSelectAll()
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

**Step 6: Commit**

```bash
git add src/App.tsx src/components/Editor.tsx src/components/MenuBar.tsx
git commit -m "feat: implement Edit menu functions (Undo/Redo/Cut/Copy/Paste)"
```

---

### Task 5: Implement Bold and Italic Formatting

**Files:**
- Modify: `src/components/MenuBar.tsx`

**Step 1: Add Bold/Italic toggle functions**

```typescript
const wrapSelection = (wrapper: string) => {
  const view = editorViewRef.current
  if (!view) return

  const { from, to } = view.state.selection.main
  const selectedText = view.state.doc.sliceString(from, to)

  const newText = wrapper + selectedText + wrapper
  view.dispatch({
    changes: { from, to, insert: newText },
    selection: { anchor: from + wrapper.length, head: to + wrapper.length }
  })
  view.focus()
}

const handleBold = () => wrapSelection('**')
const handleItalic = () => wrapSelection('*')
```

**Step 2: Add Bold/Italic buttons to Edit menu**

```jsx
<div className="border-t border-gray-700 my-1"></div>
<button onClick={handleBold} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
  <strong>Bold</strong> (Ctrl+B)
</button>
<button onClick={handleItalic} className="block w-full text-left px-4 py-2 hover:bg-gray-700">
  <em>Italic</em> (Ctrl+I)
</button>
```

**Step 3: Add keyboard shortcuts for Bold/Italic**

```typescript
if (e.ctrlKey && e.key === 'b') { e.preventDefault(); handleBold() }
if (e.ctrlKey && e.key === 'i') { e.preventDefault(); handleItalic() }
```

**Step 4: Commit**

```bash
git add src/components/MenuBar.tsx src/App.tsx
git commit -m "feat: implement Bold (Ctrl+B) and Italic (Ctrl+I) formatting"
```

---

### Task 6: Simplify StatusBar

**Files:**
- Modify: `src/components/StatusBar.tsx`
- Modify: `src/App.tsx` (remove unused props)

**Step 1: Simplify StatusBar to 3 core indicators**

Current design has many indicators. Simplify to:
```
[filename.md ●]  [Ln 1, Col 1]  [100 字符, 5 行]
```

New simplified StatusBar:
```typescript
const StatusBar: React.FC<StatusBarProps> = ({
  filePath,
  isDirty,
  lineCount,
  charCount,
  cursorPosition
}) => {
  const fileName = getFileName(filePath)
  const displayLine = cursorPosition?.line ?? lineCount
  const displayColumn = cursorPosition?.column ?? 1

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-gray-800 text-gray-300 text-sm border-t border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="font-mono">{fileName || 'Untitled'}</span>
        {isDirty && <span className="text-yellow-400">●</span>}
      </div>
      <div className="flex items-center space-x-4">
        <span>Ln {displayLine}, Col {displayColumn}</span>
        <span>{charCount} 字符, {lineCount} 行</span>
      </div>
    </div>
  )
}
```

**Step 2: Update App.tsx to pass only needed props**

Remove unused props from StatusBar usage:
```jsx
<StatusBar
  filePath={filePath}
  isDirty={isDirty}
  lineCount={lineCount}
  charCount={charCount}
  cursorPosition={cursorPosition || undefined}
/>
```

**Step 3: Update interface in StatusBar.tsx**

```typescript
interface StatusBarProps {
  filePath: string | null
  isDirty: boolean
  lineCount: number
  charCount: number
  cursorPosition?: { line: number; column: number }
}
```

**Step 4: Commit**

```bash
git add src/components/StatusBar.tsx src/App.tsx
git commit -m "refactor: simplify StatusBar to 3 core indicators"
```

---

### Task 7: Implement Exit Menu Item

**Files:**
- Modify: `src/components/MenuBar.tsx`

**Step 1: Add Exit handler**

```typescript
const handleExit = async () => {
  try {
    const { exit } = await import('@tauri-apps/api/process')
    await exit(0)
  } catch (error) {
    console.error('Exit failed:', error)
  }
}
```

**Step 2: Wire to Exit button**

```jsx
<button onClick={handleExit} className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b">
  Exit
</button>
```

**Step 3: Commit**

```bash
git add src/components/MenuBar.tsx
git commit -m "feat: implement Exit menu item"
```

---

## Phase 3: v0.2.0 Formatting Toolbar

### Task 8: Add Formatting Toolbar

**Files:**
- Create: `src/components/FormattingToolbar.tsx`
- Modify: `src/App.tsx`

**Step 1: Create FormattingToolbar component**

```typescript
import React from 'react'

interface FormattingToolbarProps {
  editorViewRef: React.MutableRefObject<any>
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ editorViewRef }) => {
  const wrapSelection = (wrapper: string) => {
    const view = editorViewRef.current
    if (!view) return

    const { from, to } = view.state.selection.main
    const selectedText = view.state.doc.sliceString(from, to)

    const newText = wrapper + selectedText + wrapper
    view.dispatch({
      changes: { from, to, insert: newText },
      selection: { anchor: from + wrapper.length, head: to + wrapper.length }
    })
    view.focus()
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-300">
      <button
        onClick={() => wrapSelection('**')}
        className="px-3 py-1 font-bold bg-white border border-gray-400 rounded hover:bg-gray-200"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        onClick={() => wrapSelection('*')}
        className="px-3 py-1 italic bg-white border border-gray-400 rounded hover:bg-gray-200"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
    </div>
  )
}

export default FormattingToolbar
```

**Step 2: Add to App.tsx**

```typescript
import FormattingToolbar from './components/FormattingToolbar'

// In JSX, between MenuBar and Editor:
<FormattingToolbar editorViewRef={editorViewRef} />
```

**Step 3: Commit**

```bash
git add src/components/FormattingToolbar.tsx src/App.tsx
git commit -m "feat: add formatting toolbar with Bold and Italic buttons"
```

---

## Phase 4: Testing and Verification

### Task 9: Run Tests and Typecheck

**Step 1: Run TypeScript check**

Run: `npm run typecheck`
Expected: No errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Run tests (if deps installed)**

Run: `npm test`
Expected: All tests pass

**Step 4: Build test**

Run: `npm run build`
Expected: Build successful

**Step 5: Commit final v0.2.0**

```bash
git add -A
git commit -m "feat: v0.2.0 - menu functions and formatting toolbar"
git tag v0.2.0
```

---

## Summary

| Task | Description | Priority |
|------|-------------|----------|
| 1 | Fix handleOpenFile definition order | P0 |
| 2 | Implement window close save | P0 |
| 3 | Fix Save As path passing | P0 |
| 4 | Implement Edit menu functions | P1 |
| 5 | Implement Bold/Italic formatting | P1 |
| 6 | Simplify StatusBar | P1 |
| 7 | Implement Exit menu | P1 |
| 8 | Add formatting toolbar | P2 |
| 9 | Testing and verification | P1 |

---

**Plan complete and saved.**

## Two Execution Options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
