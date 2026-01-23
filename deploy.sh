#!/bin/bash

# 贵州公务员职位数据可视化平台 - 部署脚本
# 端口: 5551

echo "=========================================="
echo "  贵州公务员职位数据可视化平台"
echo "  部署脚本"
echo "=========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"

# 检查包管理器
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    echo "✓ 使用 Bun 作为包管理器"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    echo "✓ 使用 npm 作为包管理器"
else
    echo "❌ 错误: 未找到包管理器"
    exit 1
fi

echo ""
echo "步骤 1/4: 安装依赖..."
$PKG_MANAGER install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo ""
echo "步骤 2/4: 构建生产版本..."
$PKG_MANAGER run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "步骤 3/4: 创建日志目录..."
mkdir -p logs

echo ""
echo "步骤 4/4: 启动应用..."

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 检查应用是否已在运行
if pm2 describe jobs-viz &> /dev/null; then
    echo "应用已在运行，正在重启..."
    $PKG_MANAGER run pm2:restart
else
    echo "启动新应用..."
    $PKG_MANAGER run pm2:start
fi

echo ""
echo "=========================================="
echo "  ✓ 部署完成！"
echo "=========================================="
echo ""
echo "应用信息:"
echo "  - 名称: jobs-viz"
echo "  - 端口: 5551"
echo "  - 地址: http://localhost:5551"
echo ""
echo "管理命令:"
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: $PKG_MANAGER run pm2:logs"
echo "  - 停止应用: $PKG_MANAGER run pm2:stop"
echo "  - 重启应用: $PKG_MANAGER run pm2:restart"
echo ""
echo "日志位置:"
echo "  - 错误日志: ./logs/err.log"
echo "  - 输出日志: ./logs/out.log"
echo "  - 合并日志: ./logs/combined.log"
echo ""
