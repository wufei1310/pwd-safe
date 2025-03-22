# 密码管理器 (Password Safe)

一个基于纯 Node.js 原生开发的轻量级多用户密码管理系统。无需数据库，采用本地文件存储，易于部署和使用。

## 核心特点

- **轻量级开发**
  - 纯 Node.js 原生开发，无重型框架依赖
  - 仅使用 Express.js 作为 Web 服务器
  - 前端采用原生 JavaScript，无需构建工具

- **简单部署**
  - 极简依赖，仅需 Node.js 环境
  - 本地文件存储，无需配置数据库
  - 一键启动，快速部署

- **本地存储**
  - 使用 JSON 文件存储用户数据
  - 文件级数据隔离，每个用户独立存储
  - 支持简单的数据备份和迁移

- **多用户支持**
  - 独立的用户账户系统
  - 每个用户数据完全隔离
  - 基于用户名和主密码的认证

- **安全加密**
  - 使用 AES-256-GCM 进行密码加密
  - PBKDF2 密钥派生
  - 服务器端加密处理
  - 安全的密码存储机制

- **密码管理**
  - 添加/编辑/删除密码条目
  - 密码分类管理
  - 支持网站 URL 存储
  - 密码查看和复制功能

- **用户界面**
  - 简洁的密码列表展示
  - 密码查看模态框
  - 密码编辑表单
  - 响应式设计

## 技术特性

- **极简技术栈**
  - 后端：纯 Node.js + Express.js
  - 前端：原生 JavaScript + HTML + CSS
  - 存储：本地 JSON 文件
  - 加密：Node.js 内置 crypto 模块

- **轻量级架构**
  - 总体积小于 1MB（不含 node_modules）
  - 启动内存占用低
  - 适合个人或小团队使用

## 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 启动服务器
```bash
node server.js
```

4. 访问应用
- 打开浏览器访问 `http://localhost:3000`
- 新用户请先访问 `/setup.html` 创建账户

## 项目结构

```
pwd-safe/
├── server.js          # 服务器入口文件
├── data/              # 数据存储目录
│   ├── users.json     # 用户信息
│   └── vault_*.json   # 用户密码库
├── js/
│   ├── login.js       # 登录逻辑
│   ├── setup.js       # 账户设置
│   ├── dashboard.js   # 主面板功能
│   ├── crypto.js      # 加密工具
│   └── storage.js     # 存储管理
└── public/
    ├── index.html     # 登录页面
    ├── setup.html     # 账户设置页面
    └── dashboard.html # 主面板页面
```

## 存储结构

```plaintext
data/
├── users.json           # 用户信息存储
└── vault_[username].json # 各用户的密码库文件
```

## 安全特性

1. 密码加密
   - 使用 AES-256-GCM 进行密码加密
   - 每个密码条目使用唯一的 IV
   - 包含认证标签(Auth Tag)验证
   
2. 密钥管理
   - 使用 PBKDF2 从主密码派生密钥
   - 使用随机盐值增强安全性
   - 服务器端进行所有加密操作

3. 数据隔离
   - 每个用户的密码库单独存储
   - 使用用户特定的加密密钥
   - 会话管理确保安全访问

## 部署优势

1. **简单快速**
   - 克隆代码后仅需安装 Express
   - 无需配置数据库环境
   - 无需复杂的构建过程

2. **资源占用低**
   - 最小化依赖
   - 高效的文件存储系统
   - 按需加载用户数据

3. **易于维护**
   - 直观的文件结构
   - 简单的数据备份方案
   - 便捷的故障排查

## 部署说明

1. 服务器配置
   - 默认监听 3000 端口
   - 支持自定义端口 (PORT 环境变量)
   - 支持所有网络接口 (0.0.0.0)

2. 生产环境建议
   - 使用 HTTPS
   - 配置反向代理 (如 Nginx)
   - 设置适当的防火墙规则

## 使用说明

1. 新用户注册
   - 访问 `/setup.html`
   - 设置用户名和主密码
   - 系统自动创建加密的密码库

2. 用户登录
   - 访问主页输入凭据
   - 验证成功后进入密码管理界面

3. 密码管理
   - 添加新密码条目
   - 查看/编辑现有密码
   - 删除不需要的密码
   - 按类别组织密码

## 性能参考

- 启动时间: < 1秒
- 内存占用: < 50MB
- 并发支持: 单实例可支持数百用户
- 响应时间: 通常 < 100ms

## 为什么选择本项目？

- **轻量级**: 整个项目非常轻量，没有复杂的依赖关系
- **易部署**: 几分钟内即可完成部署，适合快速搭建使用
- **好维护**: 采用本地文件存储，方便备份和迁移
- **高性能**: 原生开发确保了最佳性能
- **可定制**: 简单的代码结构方便按需定制功能

## 注意事项

- 请妥善保管主密码,无法找回
- 建议定期备份密码库
- 生产环境必须使用 HTTPS
- 定期更新依赖包以修复安全漏洞

## 开发计划

- [ ] 添加密码导入/导出功能
- [ ] 实现密码强度检测
- [ ] 添加双因素认证
- [ ] 支持密码库备份

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License
