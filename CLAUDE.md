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

## 待开发功能 📋

- [ ] 查找/替换功能
- [ ] 多标签页支持
- [ ] 设置面板（字体、字号）

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
└── editor.js            # 编辑器逻辑
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

## 版本管理

### 版本号规则
- 使用语义化版本号，格式：`vMAJOR.MINOR.PATCH`
  - MAJOR：不兼容的重大重构
  - MINOR：新增功能（向下兼容）
  - PATCH：bug 修复

### 发布流程
1. 代码修改完成并测试通过后
2. 创建新版本标签：
   ```bash
   git tag -a v0.x.x -m "版本描述"
   ```
3. 推送标签：
   ```bash
   git push origin v0.x.x
   ```
4. GitHub Actions 检测到标签推送，自动构建并创建 Release

### GitHub Actions 发布配置
- workflow 文件：`.github/workflows/build.yml`
- 每次推送到 master 分支自动构建
- 每次推送新标签自动创建 Release 并上传 .exe 文件

## 注意事项

1. **Tauri API 访问**：确保 `tauri.conf.json` 中 `withGlobalTauri: true`
2. **行号更新**：使用 `'\n'` 而非 `'\0'`
3. **文件路径**：跨平台兼容，使用 `/` 或 `\` 分割符处理
4. **前端 API**：使用 `@tauri-apps/api` v1.x 版本
