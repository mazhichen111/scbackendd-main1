# Scbackend

<div align="center">

![Scbackend Logo](https://img.shields.io/badge/Scbackend-v1.0.3-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**一个革命性的将 Scratch 用作后端开发语言的创新平台**

[English](docs/README-EN.md) | [演示视频](#) | [在线文档](#)

</div>

## 🚀 项目简介

Scbackend 是一个突破性的开发平台，它将可视化编程语言 Scratch 转换为强大的后端开发工具。通过集成真实的 Scratch VM（虚拟机），开发者可以使用熟悉的拖拽式编程界面来构建复杂的后端服务和API。

### ✨ 核心特性

- 🎯 **可视化后端开发**: 使用 Scratch 积木块构建后端逻辑
- 🔧 **真实 Scratch VM**: 集成官方 scratch-vm-develop，确保完整兼容性
- 🌐 **现代化 Web 界面**: 响应式设计，支持项目管理和实时监控
- 🔐 **完整认证系统**: JWT token 认证，支持用户管理和权限控制
- 📡 **WebSocket 实时通信**: 支持实时数据传输和状态同步
- 🗄️ **灵活数据存储**: JSON 文件存储，易于部署和维护
- 🔄 **项目运行管理**: 支持项目启动、停止、监控等完整生命周期管理
- 🛡️ **Node.js 兼容性**: 自动处理 Worker polyfill，确保跨平台兼容

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Scbackend 架构图                          │
├─────────────────────────────────────────────────────────────┤
│  前端界面 (Web UI)                                           │
│  ├── 登录/认证页面                                           │
│  ├── 项目管理控制台                                          │
│  ├── 实时状态监控                                            │
│  └── 密码管理功能                                            │
├─────────────────────────────────────────────────────────────┤
│  后端服务 (Node.js + Express)                               │
│  ├── RESTful API 服务                                       │
│  ├── WebSocket 实时通信                                     │
│  ├── JWT 认证中间件                                         │
│  └── 项目运行管理                                            │
├─────────────────────────────────────────────────────────────┤
│  Scratch VM 集成                                            │
│  ├── 真实 Scratch 虚拟机                                    │
│  ├── 扩展管理器                                              │
│  ├── Worker Polyfill (Node.js 兼容)                        │
│  └── 自定义 Scbackend 扩展                                  │
├─────────────────────────────────────────────────────────────┤
│  数据存储层                                                  │
│  ├── JSON 文件数据库                                        │
│  ├── 项目配置存储                                            │
│  └── 用户认证数据                                            │
└─────────────────────────────────────────────────────────────┘
```

## 📦 安装部署

### 前置项目

- **Node.js**: 版本 18.x 或更高 (推荐 22.x)
- **Git**: 用于克隆项目仓库

### 快速开始

#### 方法一：从源码安装

```bash
# 1. 克隆项目仓库
git clone https://github.com/scbackend/scbackendd.git
cd scbackendd

# 2. 安装依赖
npm install

# 3. 启动服务
npm start
```

#### 方法二：全局安装

```bash
# 全局安装
npm install scbackendd --global

# 在工作目录启动
scbackendd
```

#### 方法三：开发模式

```bash
# 克隆并链接到全局
git clone https://github.com/scbackend/scbackendd.git
cd scbackendd
npm link

# 在任意目录启动
scbackendd
```


## 🖥️ 使用指南

### 1. 访问管理界面

打开浏览器访问: `http://localhost:3030`

### 2. 登录系统

- **默认用户名**: `admin`
- **默认密码**: `admin123`
- ⚠️ **重要**: 首次登录后请立即修改默认密码

### 3. 项目管理

- **创建项目**: 点击"创建新项目"按钮
- **运行项目**: 选择项目后点击"运行"按钮
- **停止项目**: 在运行状态下点击"停止"按钮
- **删除项目**: 选择项目后点击"删除"按钮

### 4. 实时监控

- **连接状态**: 查看 WebSocket 连接状态
- **项目状态**: 实时显示项目运行状态
- **系统日志**: 查看详细的系统运行日志

## 🔧 配置说明

### 数据库配置 (dbconfig.json)

```json
{
    "type": "json",
    "file": "projects.json"
}
```

### 服务器配置

- **HTTP 端口**: 3030
- **WebSocket 端口**: 3031
- **认证方式**: JWT Token
- **数据存储**: JSON 文件

## 🛠️ 开发指南

### 项目结构

```
scbackendd/
├── src/                    # 源代码目录
│   ├── index.js           # 主入口文件
│   ├── server.js          # Express 服务器
│   ├── service.js         # 核心服务逻辑
│   ├── runner.js          # 项目运行器
│   ├── vm-adapter.js      # Scratch VM 适配器
│   ├── worker-polyfill.js # Worker 兼容性补丁
│   ├── auth.js            # 认证服务
│   ├── middleware.js      # 中间件
│   ├── projects-simple.js # 项目数据管理
│   └── logger.js          # 日志系统
├── public/                # 静态资源
│   ├── index.html         # 主界面
│   └── login.html         # 登录页面
├── scratch-vm-develop/    # Scratch VM 源码
├── docs/                  # 文档目录
└── test/                  # 测试文件
```

### API 接口

#### 认证相关
- `POST /api/login` - 用户登录
- `POST /api/change-password` - 修改密码

#### 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建新项目
- `POST /api/projects/:id/run` - 运行项目
- `POST /api/projects/:id/stop` - 停止项目
- `DELETE /api/projects/:id` - 删除项目

### 扩展开发

Scbackend 支持自定义扩展开发，可以通过以下方式添加新功能：

```javascript
// 示例：自定义扩展
class CustomExtension {
    getInfo() {
        return {
            id: 'customExtension',
            name: '自定义扩展',
            blocks: [
                {
                    opcode: 'customBlock',
                    blockType: 'command',
                    text: '执行自定义操作'
                }
            ]
        };
    }
    
    customBlock() {
        console.log('执行自定义操作');
    }
}
```

## 🧪 测试

### 运行测试

```bash
# 运行项目功能测试
node test-project-run.js

# 运行认证测试
node test-auth.js
```

### 测试覆盖

- ✅ 用户认证功能
- ✅ 项目创建和管理
- ✅ 项目运行和停止
- ✅ WebSocket 通信
- ✅ API 接口完整性

## 🔍 故障排除

### 常见问题

#### 1. Worker is not defined 错误
**解决方案**: 项目已集成 Worker polyfill，自动处理此问题。

#### 2. 端口占用
```bash
# 检查端口占用
netstat -an | findstr :3030
netstat -an | findstr :3031

# 终止占用进程
taskkill /f /pid <进程ID>
```

#### 3. 项目运行失败
- 检查项目配置是否正确
- 确认 Scratch VM 初始化成功
- 查看控制台错误日志

#### 4. 认证失败
- 确认用户名密码正确
- 检查 JWT token 是否有效
- 重启服务重置认证状态

### 日志分析

系统提供详细的日志信息，包括：
- `[INFO]` - 一般信息
- `[WARN]` - 警告信息
- `[ERROR]` - 错误信息


### 开发规范

- 使用 ES6+ 语法
- 遵循 JSDoc 注释规范
- 保持代码简洁和可读性
- 添加适当的错误处理
- 编写相应的测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Scratch](https://scratch.mit.edu/) - 提供了优秀的可视化编程平台
- [scratch-vm](https://github.com/scratchfoundation/scratch-vm) - Scratch 虚拟机核心
- [Node.js](https://nodejs.org/) - 强大的 JavaScript 运行时
- [Express.js](https://expressjs.com/) - 快速的 Web 框架

## 更新日志

- 2025-09-13 v1.0.3 - 初始版本

## 📞 联系我们

- **项目主页**: [GitHub Repository](https://github.com/scbackend/scbackendd)
- **问题反馈**: [Issues](https://github.com/scbackend/scbackendd/issues)
- **讨论交流**: [Discussions](https://github.com/scbackend/scbackendd/discussions)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**


Made with ❤️ by Scbackend Team

</div>