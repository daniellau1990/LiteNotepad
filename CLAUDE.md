# LiteNotepad - 轻量级跨平台记事本

> 快速开始：`npm run dev` 启动开发模式，`npm run build` 构建应用

## 项目概述

LiteNotepad 是一个极简、轻量的跨平台记事本替代品，基于 Tauri 1.x + Vanilla HTML/CSS/JS，目标：
- **可执行文件**: ~5MB
- **启动时间**: < 100ms

**重要**: 本项目使用纯原生前端，**不使用 React、CodeMirror、构建工具链**。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Tauri 1.x (Rust 后端) |
| 前端 | 原生 HTML + CSS + JavaScript |
| 语法高亮 | 轻量自定义正则（无 highlight.js） |
| 自动保存 | Tauri FS API + debounce |

## 核心功能 ✅ / 📋

- [ ] **核心编辑器** - textarea，行号同步滚动
- [ ] **粗体/斜体** - Ctrl+B / Ctrl+I，包装选中文本
- [ ] **Markdown 语法高亮** - 标题、代码块、粗体、斜体、链接
- [ ] **文件操作** - 打开 .txt/.md，保存/另存为
- [ ] **自动保存** - 60 秒间隔，debounce 500ms
- [ ] **状态栏** - 文件名、行数、字符数、自动保存状态
- [ ] **菜单栏** - File / Edit / Format / Help

## 架构约定

### 目录结构（目标）
```
src-tauri/
├── src/
│   ├── main.rs          # Tauri 入口
│   └── commands.rs      # 文件读写命令
src/
├── index.html           # 主页面
├── style.css            # 样式
└── editor.js            # 编辑器逻辑
```

### 自动保存规则
- **定时保存**: 每 60 秒保存一次（仅在有文件路径时）
- **关闭保存**: 监听窗口关闭事件，提示保存
- **标记脏状态**: 用户输入后标记 `*`

### 性能红线
- **禁止**: React、Vue、CodeMirror、webpack/vite 打包
- **必须**: 原生 textarea + CSS 行号
- **大文件**: > 5MB 时禁用语法高亮

## 运行命令

```bash
# 安装依赖
npm install

# 开发模式（Tauri dev）
npm run dev

# 类型检查
npm run typecheck

# 构建 Windows
npm run build:win
```

## 开发参考

详见: `docs/plans/2026-04-19-lite-notepad.md`
