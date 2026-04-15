# LiteEdit - 轻量级文本编辑器

一个极简、快速、轻量的本地文本编辑器，旨在作为系统默认 .txt 文件处理程序的替代品。

## 🎯 核心特性

- **极速启动**: 冷启动 < 1秒，热启动 < 0.5秒
- **内存高效**: 内存占用 < 30MB (Tauri 后台 + 前端)
- **跨平台**: Windows、macOS、Linux 原生支持
- **语法高亮**: 支持 `.txt`, `.md`, `.js`, `.json`, `.ts`, `.tsx`, `.html`, `.css`
- **大文件处理**: >5MB 文件仍支持语法高亮，启用流式读取
- **自动保存**: 60秒定时保存 + 500ms 去抖 + 关闭前保存
- **冲突检测**: 外部修改文件时智能提示
- **开箱即用**: 无需安装 Rust/Tauri CLI，下载即用

## 📦 下载安装

### 预编译版本 (推荐)
访问 [GitHub Releases](https://github.com/username/liteedit/releases) 下载对应平台的安装包：

- **Windows**: `LiteEdit_0.1.0_x64-setup.exe` (安装版) 或 `LiteEdit_0.1.0_x64-portable.zip` (便携版)
- **macOS**: `LiteEdit_0.1.0_aarch64.dmg` (Apple Silicon) 或 `LiteEdit_0.1.0_x64.dmg` (Intel)
- **Linux**: `LiteEdit_0.1.0_amd64.AppImage` (通用) 或 `LiteEdit_0.1.0_amd64.deb` (Debian/Ubuntu)

### 自动更新
LiteEdit 内置自动更新功能。当有新版本发布时，编辑器会提示您更新，支持一键升级。

## 🛠️ 开发构建

如需从源代码构建，需要以下环境：

### 前置要求
- Node.js 18+ 和 npm
- Rust 1.70+ (仅开发需要，用户无需安装)
- Tauri CLI (仅开发需要)

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/username/liteedit.git
cd liteedit

# 安装前端依赖
npm install

# 安装 Rust 依赖 (自动通过 Tauri)
```

### 开发运行
```bash
# 启动开发服务器
npm run dev
```

### 构建发布版本
```bash
# 构建当前平台应用
npm run build

# 构建所有平台应用
npm run package:all

# 构建特定平台
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🏗️ 技术架构

```
LiteEdit
├── Frontend (React + TypeScript)
│   ├── CodeMirror 6 - 编辑器核心
│   ├── Tailwind CSS - 样式系统
│   └── Tauri API - 系统交互
├── Backend (Rust)
│   ├── 文件 I/O 与流式读取
│   ├── 系统菜单与对话框
│   ├── 自动保存与冲突检测
│   └── 自动更新服务
└── Build System
    ├── Vite - 前端构建
    ├── Tauri - 应用打包
    └── GitHub Actions - CI/CD
```

## 🔧 性能优化

### 启动时间优化
- **代码分割**: CodeMirror 语言支持动态导入
- **预加载**: 关键资源预加载，非关键资源懒加载
- **Rust 优化**: LTO 链接优化 + 调试符号剥离

### 内存管理
- **大文件流式处理**: >5MB 文件分块读取，避免一次性加载
- **增量语法高亮**: 仅对可见区域进行语法分析
- **撤销历史限制**: 大文件模式下减少撤销步数

### 文件系统安全
- **最小权限原则**: 仅允许用户明确选择的文件路径
- **沙箱模式**: 严格 CSP 策略防止代码注入
- **路径验证**: 所有文件操作前验证路径来源

## 🚀 功能亮点

### 1. 智能大文件处理
- 流式分块读取，支持超大文件 (>100MB)
- 增量语法高亮，滚动时动态解析
- 内存映射优化，减少系统资源占用

### 2. 可靠的自动保存
- **三层保存机制**:
  1. 输入停止 500ms 后标记脏状态
  2. 每 60 秒自动保存脏文件
  3. 关闭前强制保存未保存内容
- **冲突处理**: 检测外部修改，提供覆盖/重新加载选项
- **错误恢复**: 保存失败时保留备份文件

### 3. 原生系统集成
- 系统文件关联 (默认 .txt 打开程序)
- 原生菜单和对话框
- 系统通知和托盘图标

## 📄 文件格式支持

| 格式 | 语法高亮 | 代码折叠 | 自动补全 |
|------|----------|----------|----------|
| .txt | ❌ | ❌ | ❌ |
| .md  | ✅ | ✅ | ❌ |
| .js  | ✅ | ✅ | ✅ |
| .ts  | ✅ | ✅ | ✅ |
| .json| ✅ | ✅ | ❌ |
| .html| ✅ | ✅ | ✅ |
| .css | ✅ | ✅ | ✅ |

## 🔄 自动更新流程

```
应用启动
    ↓
检查更新 (GitHub API)
    ↓
发现新版本 → 无更新 → 正常启动
    ↓
下载增量更新包
    ↓
用户确认安装
    ↓
后台静默安装
    ↓
重启应用完成更新
```

## 📊 性能指标

| 指标 | 目标值 | 实测值 |
|------|--------|--------|
| 冷启动时间 | < 1000ms | 待测量 |
| 热启动时间 | < 500ms | 待测量 |
| 内存占用 | < 30MB | 待测量 |
| 大文件加载 (10MB) | < 3s | 待测量 |
| 语法高亮延迟 | < 100ms | 待测量 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request。开发流程：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 代码规范
- TypeScript 严格模式，所有函数显式类型定义
- React 组件使用 PascalCase，Hooks 使用 camelCase
- Rust 代码遵循 clippy 建议
- 提交信息遵循 Conventional Commits

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Tauri](https://tauri.app/) - 构建小型、快速的桌面应用
- [CodeMirror 6](https://codemirror.net/) - 代码编辑器组件
- [React](https://react.dev/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架

---

**LiteEdit** - 简约而不简单，快速而不失功能。