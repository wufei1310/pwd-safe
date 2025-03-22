#!/bin/bash

# 项目配置变量
REPO_URL="https://github.com/wufei1310/pwd-safe.git"
BRANCH="main"
PROJECT_DIR="/data/project/pwd-safe"
PORT=3000
APP_NAME="pwd-safe"

# echo "当前目录: $(pwd)，配置信息:"
# echo "REPO_URL: $REPO_URL"
# echo "BRANCH: $BRANCH"
# echo "PROJECT_DIR: $PROJECT_DIR"
# echo "PORT: $PORT"
# echo "APP_NAME: $APP_NAME"

# 验证必要的变量
if [ -z "$REPO_URL" ] || [ -z "$BRANCH" ] || [ -z "$PROJECT_DIR" ] || [ -z "$PORT" ] || [ -z "$APP_NAME" ]; then
    echo "错误: 缺少必要的配置变量"
    exit 1
fi

echo "开始部署 $APP_NAME 项目..."

# 0. 确保项目目录存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "0. 创建项目目录并克隆代码..."
    mkdir -p "$PROJECT_DIR"
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
else
    echo "0. 进入项目目录..."
    cd "$PROJECT_DIR"
fi

# 1. 拉取最新代码
echo "1. 从 GitHub 拉取最新代码..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"



# 2. 安装依赖
echo "2. 安装项目依赖..."
npm install

# 3. 检查并关闭已运行的实例
echo "3. 检查并关闭已运行的实例..."
# 检查是否有应用的 PM2 实例在运行
if pm2 list | grep -q "$APP_NAME"; then
    echo "发现运行中的实例，正在停止..."
    pm2 delete "$APP_NAME"
fi

# 检查端口是否被占用
port_pid=$(lsof -t -i:"$PORT")
if [ ! -z "$port_pid" ]; then
    echo "端口 $PORT 被占用，正在关闭进程..."
    kill -9 "$port_pid"
fi

# 4. 使用 PM2 启动应用
echo "4. 使用 PM2 启动应用..."
# 检查是否存在 ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    echo "使用 ecosystem.config.js 配置启动..."
    # 替换 ecosystem.config.js 中的端口号
    sed -i "s/PORT: [0-9]*/PORT: $PORT/" ecosystem.config.js
    pm2 start ecosystem.config.js --env production
else
    echo "使用默认配置启动..."
    PORT=$PORT pm2 start server.js --name "$APP_NAME" --env production
fi

# 5. 检查启动状态
echo "5. 检查应用启动状态..."
sleep 2
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo "✅ 部署成功！应用已启动。"
    echo "应用信息:"
    echo "- 名称: $APP_NAME"
    echo "- 端口: $PORT"
    echo "- 目录: $PROJECT_DIR"
    echo ""
    echo "可以使用以下命令查看应用状态："
    echo "- pm2 list    : 查看应用列表"
    echo "- pm2 logs    : 查看应用日志"
    echo "- pm2 monit   : 监控应用状态"
    echo "- pm2 list    : 查看应用列表"
    echo "- pm2 logs    : 查看应用日志"
    echo "- pm2 restart <app_name|id>   : 重启指定的进程"
    echo "- pm2 stop <app_name|id>   : 停止指定的进程"
    echo "- pm2 delete <app_name|id>   : 删除指定的进程"

else
    echo "❌ 部署可能存在问题，请检查日志："
    pm2 logs "$APP_NAME" --lines 20
fi 