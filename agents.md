# LiteNotepad 项目开发规范

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

## 开发环境

### 运行命令
```bash
npm run dev      # 开发模式
npm run build    # 构建生产版本
```

### 技术栈
- Tauri 1.x (Rust 后端)
- 原生 HTML/CSS/JS 前端
- 无需 React、CodeMirror 等重型依赖

## 功能状态

### 已完成 ✅
- [x] 核心编辑器 - textarea，行号同步滚动
- [x] 粗体/斜体 - Ctrl+B / Ctrl+I，工具栏按钮
- [x] Markdown 语法高亮
- [x] 文件操作 - 打开、保存、另存为
- [x] 自动保存 - 60 秒间隔
- [x] 状态栏 - 文件名、行数、字符数、光标位置

### 待开发 📋
- [ ] 查找/替换功能
- [ ] 多标签页支持
- [ ] 设置面板（字体、字号）

## 注意事项

1. **行号更新**：使用 `'\n'` 而非 `'\0'`
2. **文件路径**：跨平台兼容，使用 `/` 或 `\` 分割符处理
3. **前端 API**：使用 `@tauri-apps/api` v1.x 版本
