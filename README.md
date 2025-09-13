# Scbackend

一个将 Scratch 用作后端开发语言的创新软件。

## ✨ 新功能和修复

### 🔧 已修复的问题
- ✅ 修复了 `dbconfig.json` 的 JSON 语法错误
- ✅ 解决了 `fetch` API 在 Node.js 中的兼容性问题
- ✅ 完善了数据库初始化流程
- ✅ 增强了错误处理和日志系统
- ✅ 修复了事件处理逻辑
- ✅ 改进了 WebSocket 连接管理

### 🆕 新增功能
- 🎨 全新的现代化管理界面
- 📊 实时状态监控和日志显示
- 🔄 完整的项目 CRUD 操作
- ⚡ Runner 管理和事件触发
- 🧪 内置演示和测试功能
- 📚 完整的 API 文档
- 🔒 安全性改进和输入验证

## 🚀 快速开始

### 前置条件
- Node.js 16.0.0 或更高版本
- Git

### 安装和运行

1. **克隆项目**:
   ```bash
   git clone https://github.com/scbackend/scbackendd.git
   cd scbackendd
   ```

2. **启动服务**:
   ```bash
   npm start
   ```
   
   首次运行会自动：
   - 检查 Node.js 版本
   - 安装缺失的依赖
   - 创建默认配置文件
   - 初始化数据库

3. **访问管理界面**:
   - 打开浏览器访问: http://localhost:3030
   - 演示页面: http://localhost:3030/demo.html

### 其他命令

```bash
# 开发模式（自动重启）
npm run dev

# 运行测试
npm test

# 直接启动（跳过检查）
npm run direct

# 语法检查
npm run check
```

## 🎯 使用指南

### 1. 创建 Scratch 项目

访问管理界面，点击"创建新项目"，输入：
- **项目名称**: 例如 `hello_world`
- **项目内容**: Scratch 项目的 JSON 数据

### 2. 运行项目

在项目列表中点击"运行"按钮，或使用 API：
```bash
curl http://localhost:3030/runner/add/hello_world
```

### 3. 触发事件

通过管理界面或 API 向运行中的项目发送事件：
```bash
curl -X POST http://localhost:3030/runner/hello_world/trigger \
  -H "Content-Type: application/json" \
  -d '{"event": "custom_event", "data": {"message": "Hello"}}'
```

## 📡 API 接口

### 项目管理
- `GET /projects` - 获取所有项目
- `GET /project/:id` - 获取单个项目
- `POST /create` - 创建项目
- `PUT /project/:id` - 更新项目
- `DELETE /project/:id` - 删除项目

### Runner 管理
- `GET /runners` - 获取所有 Runners
- `GET /runner/add/:id` - 添加 Runner
- `GET /runner/remove/:id` - 移除 Runner
- `POST /runner/:id/trigger` - 触发事件

### WebSocket
- 连接: `ws://localhost:3031`
- 支持实时事件广播和双向通信

## 🏗️ 项目结构

```
scbackendd/
├── src/
│   ├── index.js          # 主入口文件
│   ├── server.js         # HTTP 服务器
│   ├── service.js        # WebSocket 服务
│   ├── manager.js        # Runner 管理器
│   ├── projects.js       # 项目数据库操作
│   ├── runner.js         # Scratch VM 运行器
│   ├── logger.js         # 日志系统
│   └── errorHandler.js   # 错误处理
├── public/
│   ├── index.html        # 管理界面
│   └── demo.html         # 演示页面
├── extensions/
│   └── scbackendbasic.js # Scratch 扩展
├── docs/
│   ├── API.md           # API 文档
│   └── SECURITY.md      # 安全说明
├── start.js             # 启动脚本
└── test-server.js       # 测试脚本
```

## 🔒 安全注意事项

- 默认配置仅适用于开发环境
- 生产环境请修改数据库密码
- 建议使用防火墙限制端口访问
- 定期更新依赖包以修复安全漏洞

## 🐛 故障排除

### 常见问题

1. **端口被占用**:
   ```bash
   # 检查端口占用
   netstat -ano | findstr :3030
   netstat -ano | findstr :3031
   ```

2. **依赖安装失败**:
   ```bash
   # 清理并重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **数据库连接失败**:
   - 检查 `dbconfig.json` 配置
   - 确保 SQLite 文件权限正确
   - MySQL 用户需要有相应权限

### 日志查看

服务运行时会显示详细日志，包括：
- 服务器启动状态
- 数据库连接状态
- Runner 运行状态
- 错误和警告信息


## 📄 许可证

AGPL-3.0-only

---

**版本**: 1.0.3 
**维护者**: XQYWorld & yvhong