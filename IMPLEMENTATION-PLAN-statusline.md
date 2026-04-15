# 状态栏更新指示器实施计划

## 项目概述
按照 TDD 方式实现状态栏更新指示器功能，包括动态光标位置、文件编码检测、行结束符指示、大文件模式、自动保存状态和文件监视状态。

## TDD 工作流配置

### 步骤1: 配置测试环境
1. **添加测试依赖** (package.json)
2. **配置测试脚本** (package.json scripts)
3. **创建测试目录结构**
4. **配置 Vitest 环境**

### 步骤2: 实施场景A - 动态光标位置指示器
1. **红阶段**: 编写失败测试
2. **绿阶段**: 最小实现使测试通过
3. **重构阶段**: 优化代码结构
4. **审查阶段**: 代码质量检查

### 步骤3: 实施场景B-F (按优先级顺序)
重复步骤2的TDD循环

## 详细实施步骤

### 阶段0: 环境准备 (Day 1)

#### 任务0.1: 添加测试依赖
```bash
# 添加测试框架
npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom

# 添加类型定义
npm install -D @types/testing-library__react @types/testing-library__jest-dom
```

#### 任务0.2: 更新 package.json 配置
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  },
  "devDependencies": {
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "happy-dom": "^12.10.3",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

#### 任务0.3: 配置 Vitest
创建 `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
})
```

#### 任务0.4: 创建测试工具文件
创建 `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

#### 任务0.5: 创建测试目录结构
```
src/
├── test/
│   ├── setup.ts
│   ├── mocks/
│   │   ├── tauri.ts
│   │   └── codemirror.ts
│   └── utils/
│       └── test-utils.ts
```

### 阶段1: 动态光标位置指示器 (Days 2-3)

#### 任务1.1: 红阶段 - 编写失败测试
创建 `src/test/cursor-position.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatusBar } from '../components/StatusBar'

describe('Cursor Position Indicator', () => {
  it('should display default cursor position when no cursor data', () => {
    render(<StatusBar filePath="test.txt" isDirty={false} lineCount={10} charCount={100} />)
    expect(screen.getByText('Ln 10')).toBeInTheDocument()
    expect(screen.getByText('Col 1')).toBeInTheDocument()
  })

  it('should display dynamic cursor position when provided', () => {
    render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        cursorPosition={{ line: 5, column: 25 }}
      />
    )
    expect(screen.getByText('Ln 5')).toBeInTheDocument()
    expect(screen.getByText('Col 25')).toBeInTheDocument()
  })

  it('should update cursor position when props change', () => {
    const { rerender } = render(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        cursorPosition={{ line: 1, column: 1 }}
      />
    )
    
    expect(screen.getByText('Ln 1')).toBeInTheDocument()
    
    rerender(
      <StatusBar 
        filePath="test.txt" 
        isDirty={false} 
        lineCount={10} 
        charCount={100}
        cursorPosition={{ line: 10, column: 50 }}
      />
    )
    
    expect(screen.getByText('Ln 10')).toBeInTheDocument()
    expect(screen.getByText('Col 50')).toBeInTheDocument()
  })
})
```

运行测试确认失败:
```bash
npm test cursor-position.test.tsx
```

#### 任务1.2: 绿阶段 - 最小实现

**步骤1.2.1: 更新 StatusBar 接口**
```typescript
// src/components/StatusBar.tsx
interface StatusBarProps {
  filePath: string | null
  isDirty: boolean
  lineCount: number
  charCount: number
  cursorPosition?: { line: number; column: number }  // 新增
}
```

**步骤1.2.2: 更新 StatusBar 显示逻辑**
```typescript
const StatusBar: React.FC<StatusBarProps> = ({ 
  filePath, 
  isDirty, 
  lineCount, 
  charCount,
  cursorPosition  // 新增
}) => {
  const displayLine = cursorPosition?.line ?? lineCount
  const displayColumn = cursorPosition?.column ?? 1
  
  return (
    // ... 现有代码
    <div>
      <span className="mr-1">Ln</span>
      <span className="font-mono">{displayLine}</span>
      <span className="mx-2">Col</span>
      <span className="font-mono">{displayColumn}</span>
    </div>
    // ... 现有代码
  )
}
```

**步骤1.2.3: 更新 Editor 组件以提供光标位置**
```typescript
// src/components/Editor.tsx
import { EditorView, lineNumbers, EditorState } from '@codemirror/view'
import { useState, useEffect } from 'react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onCursorChange?: (position: { line: number; column: number }) => void  // 新增
  filePath: string | null
  isLargeFile?: boolean
}

const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  onCursorChange,  // 新增
  filePath, 
  isLargeFile 
}) => {
  // ... 现有代码
  
  useEffect(() => {
    if (!editorRef.current) return
    
    const cursorListener = EditorView.updateListener.of(update => {
      if (update.selectionSet && onCursorChange) {
        const selection = update.state.selection.main
        const line = update.state.doc.lineAt(selection.from)
        const column = selection.from - line.from + 1
        onCursorChange({ line: line.number, column })
      }
    })
    
    const extensions = [
      // ... 现有扩展
      cursorListener  // 新增
    ]
    
    // ... 现有代码
  }, [onCursorChange])
  
  // ... 现有代码
}
```

**步骤1.2.4: 更新 App 组件连接数据流**
```typescript
// src/App.tsx
function App() {
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number } | null>(null)
  
  // ... 现有代码
  
  return (
    // ... 现有代码
    <Editor 
      content={content} 
      onChange={handleContentChange}
      onCursorChange={setCursorPosition}  // 新增
      filePath={filePath}
      isLargeFile={isLargeFile}
    />
    <StatusBar 
      filePath={filePath}
      isDirty={isDirty}
      lineCount={lineCount}
      charCount={charCount}
      cursorPosition={cursorPosition || undefined}  // 新增
    />
    // ... 现有代码
  )
}
```

**步骤1.2.5: 运行测试确认通过**
```bash
npm test cursor-position.test.tsx
```

#### 任务1.3: 重构阶段

**步骤1.3.1: 提取光标位置计算逻辑**
```typescript
// src/utils/cursor-position.ts
export function calculateCursorPosition(
  state: EditorState,
  selection: Selection
): { line: number; column: number } {
  const line = state.doc.lineAt(selection.from)
  const column = selection.from - line.from + 1
  return { line: line.number, column }
}

export function formatCursorPosition(
  position: { line: number; column: number },
  template: string = 'Ln {line}, Col {column}'
): string {
  return template
    .replace('{line}', position.line.toString())
    .replace('{column}', position.column.toString())
}
```

**步骤1.3.2: 优化防抖处理**
```typescript
// src/hooks/useDebouncedCursor.ts
import { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash-es'

export function useDebouncedCursor(
  initialPosition: { line: number; column: number } | null,
  delay: number = 100
) {
  const [position, setPosition] = useState(initialPosition)
  
  const debouncedSetPosition = useCallback(
    debounce((newPosition: { line: number; column: number }) => {
      setPosition(newPosition)
    }, delay),
    [delay]
  )
  
  const updatePosition = useCallback((newPosition: { line: number; column: number }) => {
    debouncedSetPosition(newPosition)
  }, [debouncedSetPosition])
  
  useEffect(() => {
    return () => {
      debouncedSetPosition.cancel()
    }
  }, [debouncedSetPosition])
  
  return [position, updatePosition] as const
}
```

**步骤1.3.3: 更新 Editor 组件使用优化逻辑**
```typescript
// 在 Editor 组件中
import { calculateCursorPosition } from '../utils/cursor-position'
import { useDebouncedCursor } from '../hooks/useDebouncedCursor'

// ... 组件内部
const [debouncedPosition, updateDebouncedPosition] = useDebouncedCursor(null, 50)

const cursorListener = EditorView.updateListener.of(update => {
  if (update.selectionSet) {
    const position = calculateCursorPosition(update.state, update.state.selection.main)
    updateDebouncedPosition(position)
    if (onCursorChange) {
      onCursorChange(position)
    }
  }
})
```

#### 任务1.4: 代码审查阶段

**审查清单:**
- [ ] 类型安全性: 所有新增接口都有完整 TypeScript 定义
- [ ] 性能: 光标位置更新使用防抖，避免频繁重渲染
- [ ] 可访问性: 光标位置信息对屏幕阅读器友好
- [ ] 测试覆盖: 单元测试覆盖所有主要场景
- [ ] 错误处理: 处理边缘情况（空选择、文档边界）
- [ ] 代码规范: 符合项目编码规范

**运行完整测试套件:**
```bash
npm test
npm run typecheck
npm run lint
```

### 阶段2: 大文件模式指示器 (Day 4)

#### 任务2.1: 红阶段 - 编写失败测试
创建 `src/test/large-file-indicator.test.tsx`

#### 任务2.2: 绿阶段 - 最小实现
1. 将 `isLargeFile` 从 App 传递到 StatusBar
2. 在 StatusBar 中添加大文件模式显示
3. 添加悬停提示显示详细信息

#### 任务2.3: 重构阶段
1. 提取文件大小阈值配置
2. 创建大文件模式 Hook
3. 优化指示器 UI 组件

#### 任务2.4: 代码审查
验证大文件检测逻辑和 UI 显示

### 阶段3: 文件编码检测与显示 (Days 5-6)

#### 任务3.1: 红阶段 - 编写失败测试
创建 `src/test/file-encoding.test.ts`

#### 任务3.2: 绿阶段 - 最小实现
1. 创建编码检测工具函数
2. 在文件打开时检测编码
3. 更新 StatusBar 显示编码信息

#### 任务3.3: 重构阶段
1. 优化编码检测算法
2. 添加编码数据库
3. 实现编码切换功能

#### 任务3.4: 代码审查
验证编码检测准确性和性能

### 阶段4: 行结束符指示器 (Day 7)

#### 任务4.1: 红阶段 - 编写失败测试
创建 `src/test/line-ending.test.ts`

#### 任务4.2: 绿阶段 - 最小实现
1. 创建行结束符检测工具
2. 在文件打开时检测行结束符
3. 更新 StatusBar 显示行结束符类型

#### 任务4.3: 重构阶段
1. 优化检测算法
2. 添加行结束符转换功能
3. 实现标准化处理

#### 任务4.4: 代码审查
验证跨平台兼容性和准确性

### 阶段5: 自动保存状态指示器 (Days 8-9)

#### 任务5.1: 红阶段 - 编写失败测试
创建 `src/test/auto-save-indicator.test.ts`

#### 任务5.2: 绿阶段 - 最小实现
1. 创建 useAutoSave Hook
2. 实现自动保存状态机
3. 更新 StatusBar 显示保存状态

#### 任务5.3: 重构阶段
1. 优化状态机设计
2. 添加上次保存时间显示
3. 实现错误恢复机制

#### 任务5.4: 代码审查
验证状态机正确性和用户体验

### 阶段6: 文件监视状态指示器 (Days 10-11)

#### 任务6.1: 红阶段 - 编写失败测试
创建 `src/test/file-watch-indicator.test.ts`

#### 任务6.2: 绿阶段 - 最小实现
1. 集成 notify 库
2. 创建 useFileWatch Hook
3. 更新 StatusBar 显示监视状态

#### 任务6.3: 重构阶段
1. 优化文件监视性能
2. 实现冲突解决界面
3. 添加监视配置选项

#### 任务6.4: 代码审查
验证跨平台兼容性和健壮性

## 时间估算

| 阶段 | 任务 | 天数 | 开始日期 | 结束日期 |
|------|------|------|----------|----------|
| 0 | 环境准备 | 1 | Day 1 | Day 1 |
| 1 | 光标位置指示器 | 2 | Day 2 | Day 3 |
| 2 | 大文件模式指示器 | 1 | Day 4 | Day 4 |
| 3 | 文件编码检测 | 2 | Day 5 | Day 6 |
| 4 | 行结束符指示器 | 1 | Day 7 | Day 7 |
| 5 | 自动保存状态指示器 | 2 | Day 8 | Day 9 |
| 6 | 文件监视状态指示器 | 2 | Day 10 | Day 11 |
| **总计** | | **9** | | |

**缓冲时间**: 2天 (风险应对)
**总工期**: 11个工作日

## 质量保证措施

### 每日检查点
1. **早晨站会**: 检查前日进展，计划当日任务
2. **代码提交**: 每日至少一次提交，包含完整测试
3. **代码审查**: 当日代码当日审查
4. **测试运行**: 提交前运行完整测试套件

### 每周里程碑
1. **Week 1**: 完成阶段0-2 (环境+光标位置+大文件模式)
2. **Week 2**: 完成阶段3-4 (文件编码+行结束符)
3. **Week 3**: 完成阶段5-6 (自动保存+文件监视)

### 验收标准
1. **功能验收**: 所有测试用例通过
2. **性能验收**: 满足性能指标（更新延迟 < 100ms）
3. **质量验收**: 通过代码审查和静态分析
4. **用户验收**: 核心功能用户测试通过

## 风险与缓解

### 技术风险
1. **CodeMirror 集成复杂性**
   - 缓解: 深入研究 CodeMirror 6 文档，创建隔离层
2. **跨平台文件监视稳定性**
   - 缓解: 实现轮询备选方案，添加平台特定优化
3. **编码检测准确性**
   - 缓解: 集成成熟编码检测库作为备选

### 进度风险
1. **依赖安装问题**
   - 缓解: 提前验证开发环境，提供安装脚本
2. **测试框架配置问题**
   - 缓解: 使用标准化配置模板
3. **功能范围蔓延**
   - 缓解: 严格执行功能范围，新增需求进入后续迭代

## 交付成果

### 代码交付
1. 完整实现的状态栏更新指示器功能
2. 全面的单元测试和集成测试套件
3. 完善的类型定义和文档
4. 性能优化和错误处理代码

### 文档交付
1. 用户使用指南
2. 开发者API文档
3. 测试策略文档
4. 部署和配置指南

### 质量报告
1. 测试覆盖率报告 (>90%)
2. 性能基准测试报告
3. 代码质量分析报告
4. 用户验收测试报告

## 后续工作建议

### 短期优化 (迭代1)
1. 添加状态栏配置界面
2. 实现状态栏主题支持
3. 添加状态栏快捷键

### 中期规划 (迭代2)
1. 状态栏插件系统
2. 自定义状态指示器
3. 状态历史记录功能

### 长期愿景 (迭代3)
1. 状态栏布局拖拽调整
2. 状态数据可视化
3. 智能状态预测和提示

---

*本计划遵循 TDD 原则，确保代码质量和可维护性。每个阶段都包含完整的红-绿-重构-审查循环。*