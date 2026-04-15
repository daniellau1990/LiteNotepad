# 依赖安装帮助指南

## 问题诊断

### 检查网络连接
```bash
# 测试npm源连接
npm ping

# 查看当前配置
npm config list

# 测试具体包的可访问性
npm view react version
```

### 检查环境问题
```bash
# 检查Node.js和npm版本
node --version
npm --version

# 检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Windows检查
echo %HTTP_PROXY%
echo %HTTPS_PROXY%
```

## 解决方案

### 方案1：使用淘宝镜像（推荐）
```bash
# 永久设置
npm config set registry https://registry.npmmirror.com
npm config set disturl https://npmmirror.com/dist
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass/
npm config set puppeteer_download_host https://npmmirror.com/mirrors

# 临时使用
npm install --registry=https://registry.npmmirror.com
```

### 方案2：使用cnpm（中国npm）
```bash
# 安装cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com

# 使用cnpm安装
cnpm install
```

### 方案3：离线安装
```bash
# 步骤1：在其他有网络的机器安装
mkdir temp-install
cd temp-install
npm init -y
npm install react react-dom vitest @testing-library/react --save
# 复制node_modules到项目

# 步骤2：使用本地文件安装
npm install file:/path/to/local/package.tgz
```

### 方案4：分步安装核心包
```bash
# 先安装最小运行时
npm install react react-dom @tauri-apps/api --no-optional

# 再安装开发依赖  
npm install typescript vite @vitejs/plugin-react --save-dev --no-optional

# 最后安装测试相关
npm install vitest happy-dom @testing-library/react --save-dev --no-optional
```

## 项目特定配置

### .npmrc 文件配置
在项目根目录创建 `.npmrc` 文件：
```
registry=https://registry.npmmirror.com/
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
electron_mirror=https://npmmirror.com/mirrors/electron/
disturl=https://npmmirror.com/dist
```

### package.json 修正
已修正以下问题：
- 移除不存在的包 `@types/testing-library__react`
- 确保所有包版本兼容

## 验证安装成功

### 基本验证
```bash
# 检查关键包
npm list --depth=0

# 运行TypeScript检查
npx tsc --noEmit

# 测试运行
npx vitest --version
```

### 功能验证
```bash
# 测试React组件
npm run test -- cursor-position

# 完整测试套件
npm run test:all
```

## 常见错误解决

### 错误：ETARGET - No matching version found
**原因**：包名错误或版本不存在
**解决**：
```bash
# 查看可用版本
npm view @types/testing-library__react versions

# 安装最新版本
npm install @types/testing-library__react@latest
```

### 错误：网络超时
**原因**：网络连接问题
**解决**：
```bash
# 增加超时时间
npm install --fetch-timeout=600000

# 使用离线模式
npm install --offline
```

### 错误：权限不足
**原因**：Windows权限限制
**解决**：
```bash
# 使用管理员权限
# 或以普通用户运行
npm install --no-optional --no-audit
```

## 紧急备用方案

如果所有方法都失败，可以：

1. **使用预构建的依赖包**：联系项目维护者获取完整的node_modules压缩包
2. **Docker环境**：使用Docker容器中的预配置环境
3. **在线IDE**：使用GitHub Codespaces或类似服务

## 联系支持

- **项目仓库**：https://github.com/your-org/liteedit
- **问题反馈**：创建GitHub Issue
- **社区支持**：相关技术论坛

---
*最后更新：2026-04-16*
*适用于LiteEdit v0.1.1*