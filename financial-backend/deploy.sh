#!/bin/bash

# 财务后端一键部署脚本
# 作者: 系统管理员
# 用途: 快速部署和启动财务分析后端服务

set -e  # 遇到错误立即退出

echo "🚀 开始部署财务后端服务..."

# 检查是否在正确的目录
if [ ! -f "app.js" ]; then
    echo "❌ 错误: 未找到 app.js 文件，请确保在正确的后端目录中执行此脚本"
    exit 1
fi

# 1. 停止现有的PM2进程（如果存在）
echo "🔄 停止现有服务..."
pm2 stop financial-backend 2>/dev/null || echo "   没有找到现有的 financial-backend 进程"
pm2 delete financial-backend 2>/dev/null || echo "   没有需要删除的进程"

# 2. 清理可能占用3000端口的进程
echo "🧹 清理端口3000..."
PORT_PID=$(lsof -ti:3000 2>/dev/null || echo "")
if [ ! -z "$PORT_PID" ]; then
    echo "   发现端口3000被进程 $PORT_PID 占用，正在清理..."
    kill -9 $PORT_PID 2>/dev/null || echo "   进程已经不存在"
    sleep 2
fi

# 3. 安装依赖
echo "📦 安装依赖包..."
npm install --production

# 4. 创建日志目录
echo "📁 创建日志目录..."
mkdir -p logs

# 5. 检查PM2配置文件
if [ ! -f "ecosystem.config.js" ]; then
    echo "📝 创建PM2配置文件..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'financial-backend',
    script: 'app.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
fi

# 6. 启动服务
echo "🚀 启动PM2服务..."
pm2 start ecosystem.config.js
   pm2 logs financial-backend
# 7. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 8. 健康检查
echo "🔍 进行健康检查..."
HEALTH_CHECK=$(curl -s http://47.111.95.19:3000/health || echo "failed")
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo "✅ 服务启动成功！"
    echo "   - 服务地址: http://47.111.95.19:3000"
    echo "   - 健康检查: http://47.111.95.19:3000/health"
    echo "   - 服务状态: $(echo $HEALTH_CHECK | jq -r '.message' 2>/dev/null || echo '财务分析后端服务运行正常')"
else
    echo "❌ 服务启动失败，请检查日志:"
    echo "   pm2 logs financial-backend"
    exit 1
fi

# 9. 显示服务状态
echo ""
echo "📊 服务状态:"
pm2 status

echo ""
echo "🎉 部署完成！"
echo ""
echo "常用管理命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs financial-backend"
echo "  重启服务: pm2 restart financial-backend"
echo "  停止服务: pm2 stop financial-backend"
echo "  删除服务: pm2 delete financial-backend"
echo ""
echo "如需重新部署，请再次运行: ./deploy.sh"