# Scbackend API 文档

## 概述

Scbackend 提供 RESTful API 和 WebSocket 接口来管理 Scratch 项目和 Runner。

## 基础信息

- **管理端口**: 3030 (HTTP/HTTPS)
- **服务端口**: 3031 (WebSocket)
- **数据格式**: JSON

## REST API 端点

### 项目管理

#### 获取所有项目
```
GET /projects
```
**响应**:
```json
[
  {
    "name": "project1",
    "body": "{...}",
    "meta": "{...}"
  }
]
```

#### 获取单个项目
```
GET /project/:id
```
**参数**:
- `id`: 项目名称

**响应**:
```json
{
  "name": "project1",
  "body": "{...}",
  "meta": "{...}"
}
```

#### 创建项目
```
POST /create
```
**请求体**:
```json
{
  "name": "project_name",
  "body": "{\"targets\": [], \"monitors\": [], \"extensions\": [], \"meta\": {\"semver\": \"3.0.0\"}}"
}
```

#### 更新项目
```
PUT /project/:id
```
**请求体**:
```json
{
  "body": "{...}"
}
```

#### 删除项目
```
DELETE /project/:id
```

### Runner 管理

#### 获取所有 Runners
```
GET /runners
```
**响应**:
```json
[
  {
    "id": "runner1",
    "status": "active",
    "initialized": true
  }
]
```

#### 添加 Runner
```
GET /runner/add/:runnerId
```

#### 移除 Runner
```
GET /runner/remove/:runnerId
```

#### 触发 Runner 事件
```
POST /runner/:runnerId/trigger
```
**请求体**:
```json
{
  "event": "custom_event",
  "data": {...}
}
```

### 扩展管理

#### 获取扩展
```
GET /extensions/:id
```
**参数**:
- `id`: 扩展名称 (只允许字母数字字符)

## WebSocket API

### 连接
```
ws://localhost:3031
```

### 消息格式

#### 握手
**发送**:
```json
{
  "type": "handshake"
}
```

**响应**:
```json
{
  "type": "handshake",
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "serverVersion": "1.0.3"
}
```

#### 事件广播
**接收**:
```json
{
  "type": "event",
  "event": "message",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 错误处理

### HTTP 状态码
- `200`: 成功
- `400`: 请求错误
- `401`: 未授权
- `404`: 资源不存在
- `409`: 冲突 (如重复创建)
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "error": "Error Type",
  "message": "详细错误信息"
}
```

## 示例用法

### 创建并运行项目

1. **创建项目**:
```bash
curl -X POST http://localhost:3030/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hello_world",
    "body": "{\"targets\": [], \"monitors\": [], \"extensions\": [], \"meta\": {\"semver\": \"3.0.0\"}}"
  }'
```

2. **启动 Runner**:
```bash
curl http://localhost:3030/runner/add/hello_world
```

3. **触发事件**:
```bash
curl -X POST http://localhost:3030/runner/hello_world/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "event": "start",
    "data": {"message": "Hello World"}
  }'
```

## 安全注意事项

- 所有输入都会进行验证
- 项目名称只允许字母数字字符和连字符
- JSON 数据会进行格式验证
- 建议在生产环境中使用 HTTPS
- 定期更新依赖包以修复安全漏洞