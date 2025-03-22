# PWD-Safe：轻量级密码管理系统

一个追求极简的密码管理系统，专注于轻量、易部署、高效。

## 🚀 极简设计

### 轻量级技术栈
```
后端：Node.js + Express.js
前端：原生 JavaScript + HTML
存储：本地 JSON 文件
加密：Node.js 内置 crypto
```

### 极简依赖
- 仅需 Node.js 环境
- 无需数据库
- 无需构建工具
- 无重型框架

### 资源占用
- 代码体积 < 1MB（不含 node_modules）
- 内存占用 < 50MB
- 启动时间 < 1秒
- 响应时间 < 100ms

## 📦 目录结构

```
your-root-directory/
├── data/                # 数据目录（独立存储）
│   ├── users.json      # 用户信息
│   └── vault_*.json    # 密码库文件
└── pwd-safe/           # 应用目录
    ├── server.js       # 服务器入口
    ├── js/            # 前端逻辑
    └── *.html         # 页面文件
```

## 🔒 数据存储

### 文件级隔离
- 每个用户独立的密码库文件
- JSON 格式易于备份和迁移
- 支持多实例共享数据目录

### 安全加密
- AES-256-GCM 加密算法
- PBKDF2 密钥派生
- 随机盐值 + IV
- 服务端加密

## ⚡ 快速开始

1. 克隆项目
```bash
git clone https://github.com/wufei1310/pwd-safe.git
```

2. 一键部署
```bash
# Linux/Mac
./deploy.sh

3. 访问应用
```
http://localhost:3000
```

## 💡 特色功能

- 多用户支持
- 密码分类管理
- 导入/导出功能
- 一键部署
- 简单备份/迁移

## 🛠️ 部署方案

### 标准部署
```bash
# 1. 创建目录
mkdir -p /data/project/data

# 2. 克隆项目
git clone https://github.com/wufei1310/pwd-safe.git /data/project/pwd-safe

# 3. 启动服务
cd /data/project/pwd-safe
npm install
node server.js
```


### PM2 部署
```bash
pm2 start server.js --name pwd-safe
```

## 📋 环境要求

- Node.js >= 14
- 磁盘空间 >= 10MB
- 内存 >= 100MB

## 🔍 性能指标

| 指标 | 数值 |
|------|------|
| 启动时间 | < 1秒 |
| 内存占用 | < 50MB |
| 并发支持 | 数百用户 |
| 响应时间 | < 100ms |

## 🚦 状态监控

```bash
# 查看日志
tail -f /data/project/data/pwd-safe.log

# 检查进程
ps aux | grep node

# 监控端口
netstat -nltp | grep 3000
```

## �� 为什么选择本项目？

- **轻量级**: 极简依赖，快速部署
- **高性能**: 原生开发，响应迅速
- **易维护**: 简单架构，方便定制
- **可靠性**: 本地存储，易于备份
- **安全性**: 强加密，数据隔离

## 🔐 安全建议

- 使用 HTTPS
- 定期备份数据
- 及时更新依赖
- 设置防火墙
- 监控日志

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 PR！
