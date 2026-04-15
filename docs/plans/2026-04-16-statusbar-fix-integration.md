# StatusBar 修复与集成计划

## 目标
修复状态栏更新指示器功能中的接口不匹配问题，完成自动保存和大文件流式读取的集成，确保所有测试通过。

## 背景
状态栏更新指示器功能的前端实现已完成（8个任务），但在集成过程中发现以下问题：
1. StatusBar 组件 Props 接口与 App.tsx 实际传递参数不匹配
2. 自动保存钩子的 `onSave` 回调仅打印日志，未实际写入文件
3. 大文件流式读取仅检测，未实现分块加载 UI
4. 依赖安装因网络问题失败，导致测试无法运行

## 问题分析

### 1. StatusBar 接口不匹配
- **文件**: `src/components/StatusBar.tsx:4-30`
- **问题**: Props 定义使用 `isAutoSaving?: boolean` 和 `isFileWatched?: boolean`
- **实际使用**: App.tsx 传递 `autoSaveState`（字符串状态）和 `fileWatchState`
- **影响**: 状态栏无法正确显示自动保存和文件监视状态
- **修复方案**: 更新 Props 接口，支持状态枚举类型

### 2. 自动保存无实际文件写入
- **文件**: `src/hooks/useAutoSave.ts:38-45`
- **问题**: `onSave` 回调仅打印日志，未调用 Tauri `write_file` 命令
- **影响**: 自动保存功能不完整，无法实际保存文件
- **修复方案**: 集成 Tauri 文件写入命令，处理错误情况

### 3. 大文件流式读取未实现
- **文件**: `src/App.tsx:106-109`
- **问题**: 检测到大文件时仅打印日志，未启用流式读取
- **影响**: 大文件处理性能未优化
- **修复方案**: 集成 `read_file_chunk` 命令，实现分块加载 UI

### 4. 依赖安装失败
- **问题**: `npm install` 因网络问题超时
- **影响**: 无法运行测试验证功能
- **修复方案**: 使用国内镜像或分步安装，确保测试环境可用

## 任务分解

### 任务 1：修复 StatusBar 组件接口（已完成）
- **文件**: `src/components/StatusBar.tsx`
- **修改内容**:
  - 更新 Props 接口：`autoSaveState?: 'idle' | 'saving' | 'saved' | 'error'`
  - 更新 Props 接口：`fileWatchState?: 'synced' | 'watching' | 'modified' | 'error'`
  - 移除废弃属性：`isAutoSaving` 和 `isFileWatched`
  - 更新渲染逻辑：显示状态文本和图标
- **测试命令**: `npm run test`（需依赖安装后）
- **验证**: 集成测试通过

### 任务 2：更新 App.tsx 参数传递（已完成）
- **文件**: `src/App.tsx:177-191`
- **修改内容**:
  - 移除 `isFileWatched` 属性传递
  - 确保 `lineEndings` 类型兼容（更新为 string）
- **测试命令**: `npm run typecheck`
- **验证**: TypeScript 类型检查通过

### 任务 3：解决依赖安装问题
- **步骤**:
  1. 清理 npm 缓存：`npm cache clean --force`
  2. 使用国内镜像：`npm config set registry https://registry.npmmirror.com`
  3. 分步安装：先安装核心依赖，再安装开发依赖
  4. 验证安装：`npm list` 检查关键包
- **验收标准**: `node_modules` 目录存在，可运行 `npm run test`

### 任务 4：实现自动保存文件写入
- **文件**: `src/hooks/useAutoSave.ts`
- **修改内容**:
  ```typescript
  onSave: async (contentToSave) => {
    if (!filePath) return
    try {
      await invoke('write_file', { 
        path: filePath, 
        content: contentToSave 
      })
      // 更新状态
    } catch (error) {
      // 错误处理
    }
  }
  ```
- **测试文件**: `src/test/auto-save.test.tsx`
- **测试命令**: `npm run test -- auto-save`
- **验证**: 自动保存测试通过，文件实际写入验证

### 任务 5：集成大文件流式读取
- **文件**: `src/App.tsx` 和 `src/components/Editor.tsx`
- **修改内容**:
  - 大文件检测后启用分块加载模式
  - 集成 `read_file_chunk` Tauri 命令
  - 实现 CodeMirror 流式内容更新
- **测试文件**: `src/test/large-file-indicator.test.tsx`
- **测试命令**: `npm run test -- large-file`
- **验证**: 大文件指示器测试通过，内存使用可控

### 任务 6：运行完整测试套件
- **步骤**:
  1. 运行类型检查：`npm run typecheck`
  2. 运行代码检查：`npm run lint`
  3. 运行单元测试：`npm run test`
  4. 运行集成测试：`npm run test -- integration`
- **验收标准**: 所有测试通过，无类型错误

### 任务 7：更新文档和版本控制
- **文件更新**:
  - `Version.md`: 添加 v0.1.1 版本记录
  - `tasks.md`: 添加版本控制规范
  - `docs/plans/`: 创建本计划文件
- **Git 操作**:
  - 初始化 git 仓库（如未初始化）
  - 提交所有更改
  - 创建版本标签：`git tag v0.1.1`

## 验收标准

### 功能验收
1. ✅ StatusBar 正确显示所有状态指示器
2. ✅ 自动保存每60秒实际写入文件
3. ✅ 大文件（>5MB）启用流式读取模式
4. ✅ 文件外部修改检测并提示用户

### 质量验收
1. ✅ 所有 TypeScript 类型检查通过
2. ✅ 所有 ESLint 规则通过
3. ✅ 所有单元测试通过（覆盖率 ≥ 90%）
4. ✅ 集成测试通过

### 文档验收
1. ✅ Version.md 更新到最新版本
2. ✅ tasks.md 包含版本控制规范
3. ✅ 本计划文件存档
4. ✅ Git 提交信息规范

## 风险评估

### 高风险
- **依赖安装失败**：影响测试和构建
  - **缓解**：使用镜像、分步安装、离线包

### 中风险
- **自动保存竞争条件**：同时多个保存操作
  - **缓解**：实现保存队列，错误重试机制

### 低风险
- **大文件内存使用**：流式读取实现复杂度
  - **缓解**：分块大小优化，内存监控

## 时间估算
- 任务 1-2：已完成（1小时）
- 任务 3：30分钟（依赖网络状况）
- 任务 4：1小时
- 任务 5：2小时
- 任务 6：30分钟
- 任务 7：30分钟
- **总计**: 5.5小时

## 责任人
- 开发：AI 助手（opencode）
- 审查：用户
- 测试：自动化测试套件

---
*计划创建: 2026-04-16*
*基于状态栏更新指示器实施计划（2026-04-15）*