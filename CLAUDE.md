# LiteNotepad - 轻量级跨平台记事本

> 快速开始：`npm run dev` 启动开发模式，`npm run build:win` 构建 Windows 版本

## 项目概述

LiteNotepad 是一个极简、轻量的跨平台记事本替代品，基于 Tauri 1.x + Vanilla HTML/CSS/JS。

**目标指标**：
- 可执行文件: ~5MB
- 启动时间: < 100ms

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Tauri 1.x (Rust 后端) |
| 前端 | 原生 HTML + CSS + JavaScript |
| 语法高亮 | 轻量自定义正则（无 highlight.js） |
| 自动保存 | Tauri FS API + debounce |

## 已完成功能 ✅

- [x] **核心编辑器** - textarea，行号同步滚动
- [x] **粗体/斜体** - Ctrl+B / Ctrl+I，包装选中文本
- [x] **Markdown 语法高亮** - 标题、代码块、粗体、斜体、链接
- [x] **文件操作** - 打开 .txt/.md，保存/另存为
- [x] **自动保存** - 60 秒间隔
- [x] **状态栏** - 文件名、行数、字符数、光标位置、自动保存状态
- [x] **菜单栏** - File / Edit / Format / Help
- [x] **窗口关闭保存** - 关闭前提示保存

## 目录结构

```
src-tauri/
├── src/
│   ├── main.rs          # Tauri 入口
│   └── commands.rs     # 文件读写命令
├── Cargo.toml           # Rust 依赖
├── build.rs             # 构建脚本
└── tauri.conf.json      # Tauri 配置

src/
├── index.html           # 主页面
├── style.css            # 样式
└── editor.js           # 编辑器逻辑
```

## 运行命令

```bash
# 安装依赖
npm install

# 开发模式（Tauri dev）
npm run dev

# 构建 Windows
npm run build:win
```

## 开发参考

详见: `docs/plans/2026-04-19-lite-notepad.md`
