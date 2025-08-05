#!/bin/bash

# 财务分析平台全栈自动化部署脚本
# 用途: 一键部署前端和后端服务
# 使用方法: ./deploy-all.sh [frontend|backend|all]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

BACKEND_DIR="/root/D/financial-backend"
FRONTEND_DIR="/root/D/financial-analytics-platform"
DIST_DIR="$FRONTEND_DIR/dist"
BACKUP_DIR="/root/D/backup"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

section() {
    echo -e "${PURPLE}[SECTION]${NC} $1"
    echo "=================================="
}

check_dependencies() {
    log "检查系统依赖..."
    
    local missing_deps=()
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v nginx &> /dev/null; then
        missing_deps+=("nginx")
    fi
    
    if ! command -v pm2 &> /dev/null; then
        missing_deps+=("pm2")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "缺少依赖: ${missing_deps[*]}"
        log "请先安装缺少的依赖"
        exit 1
    fi
    
    success "依赖检查通过"
}

backup_current() {
    log "备份当前部署..."
    
    if [ -d "$DIST_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="dist_backup_$(date +%Y%m%d_%H%M%S)"
        cp -r "$DIST_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        success "前端备份完成: $BACKUP_DIR/$BACKUP_NAME"
    else
        warning "没有找到现有的前端dist目录"
    fi
}

deploy_backend() {
    section "部署后端服务"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        error "后端目录不存在: $BACKEND_DIR"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    if [ ! -f "app.js" ]; then
        error "未找到 app.js 文件"
        return 1
    fi
    
    log "停止现有后端服务..."
    pm2 stop financial-backend 2>/dev/null || echo "   没有找到现有的 financial-backend 进程"
    pm2 delete financial-backend 2>/dev/null || echo "   没有需要删除的进程"
    
    log "清理端口3000..."
    PORT_PID=$(lsof -ti:3000 2>/dev/null || echo "")
    if [ ! -z "$PORT_PID" ]; then
        warning "发现端口3000被进程 $PORT_PID 占用，正在清理..."
        kill -9 $PORT_PID 2>/dev/null || echo "   进程已经不存在"
        sleep 2
    fi
    
    log "安装后端依赖..."
    npm install --production
    
    log "创建日志目录..."
    mkdir -p logs
    
    if [ ! -f "ecosystem.config.js" ]; then
        log "创建PM2配置文件..."
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
    
    log "启动后端PM2服务..."
    pm2 start ecosystem.config.js
    
    log "等待后端服务启动..."
    sleep 5
    
    log "后端健康检查..."
    local retry_count=0
    local max_retries=10
    
    while [ $retry_count -lt $max_retries ]; do
        HEALTH_CHECK=$(curl -s http://127.0.0.1:3000/health || echo "failed")
        if [[ $HEALTH_CHECK == *"ok"* ]]; then
            success "后端服务启动成功！"
            success "   - 服务地址: http://127.0.0.1:3000"
            success "   - 健康检查: http://127.0.0.1:3000/health"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        log "健康检查失败，重试 $retry_count/$max_retries..."
        sleep 3
    done
    
    error "后端服务启动失败，请检查日志: pm2 logs financial-backend"
    return 1
}

deploy_frontend() {
    section "部署前端服务"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        error "前端目录不存在: $FRONTEND_DIR"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f "package.json" ]; then
        error "package.json 文件不存在"
        return 1
    fi
    
    backup_current
    
    log "开始构建前端项目..."
    
    if [ -d "$DIST_DIR" ]; then
        rm -rf "$DIST_DIR"
        log "清理旧的构建文件"
    fi
    
    npx vite build
    
    if [ $? -ne 0 ]; then
        error "前端项目构建失败"
        return 1
    fi
    
    success "前端项目构建成功"
    
    log "设置前端文件权限..."
    if [ -d "$DIST_DIR" ]; then
        chmod -R 755 "$DIST_DIR"
        chown -R www-data:www-data "$DIST_DIR"
        success "权限设置完成"
    else
        error "构建目录不存在"
        return 1
    fi
    
    log "测试nginx配置..."
    nginx -t
    if [ $? -ne 0 ]; then
        error "nginx配置测试失败"
        return 1
    fi
    
    log "重载nginx..."
    systemctl reload nginx
    if [ $? -ne 0 ]; then
        error "nginx重载失败"
        return 1
    fi
    
    log "验证前端部署..."
    sleep 2
    
    if curl -f -s http://127.0.0.1 > /dev/null; then
        success "前端部署验证成功 - 网站可访问"
        return 0
    else
        error "前端部署验证失败 - 网站无法访问"
        return 1
    fi
}

show_status() {
    section "服务状态"
    
    echo "后端服务状态:"
    pm2 status financial-backend 2>/dev/null || echo "   后端服务未运行"
    
    echo ""
    echo "nginx服务状态:"
    systemctl status nginx --no-pager -l || echo "   nginx服务状态异常"
    
    echo ""
    echo "端口占用情况:"
    echo "   端口3000: $(lsof -ti:3000 2>/dev/null || echo '未占用')"
    echo "   端口80: $(lsof -ti:80 2>/dev/null || echo '未占用')"
}

show_deployment_info() {
    section "部署信息"
    echo "后端目录: $BACKEND_DIR"
    echo "前端目录: $FRONTEND_DIR"
    echo "构建目录: $DIST_DIR"
    echo "备份目录: $BACKUP_DIR"
    echo ""
    echo "访问地址:"
    echo "   前端: http://127.0.0.1"
    echo "   后端API: http://127.0.0.1:3000"
    echo "   健康检查: http://127.0.0.1:3000/health"
    echo ""
    echo "常用管理命令:"
    echo "   查看后端状态: pm2 status"
    echo "   查看后端日志: pm2 logs financial-backend"
    echo "   重启后端: pm2 restart financial-backend"
    echo "   停止后端: pm2 stop financial-backend"
    echo "   重载nginx: systemctl reload nginx"
    echo "   查看nginx状态: systemctl status nginx"
    echo "   重新部署: ./deploy-all.sh"
}

show_help() {
    echo "财务分析平台全栈部署脚本"
    echo ""
    echo "用法: ./deploy-all.sh [选项]"
    echo ""
    echo "选项:"
    echo "  frontend    仅部署前端"
    echo "  backend     仅部署后端"
    echo "  all         部署前端和后端 (默认)"
    echo "  status      查看服务状态"
    echo "  help        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./deploy-all.sh              # 部署全部"
    echo "  ./deploy-all.sh backend      # 仅部署后端"
    echo "  ./deploy-all.sh frontend     # 仅部署前端"
    echo "  ./deploy-all.sh status       # 查看状态"
}

main() {
    local deployment_type=${1:-all}
    
    case $deployment_type in
        "help")
            show_help
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        "backend")
            log "开始后端部署..."
            check_dependencies
            if deploy_backend; then
                success "后端部署完成！"
                show_deployment_info
            else
                error "后端部署失败！"
                exit 1
            fi
            ;;
        "frontend")
            log "开始前端部署..."
            check_dependencies
            if deploy_frontend; then
                success "前端部署完成！"
                show_deployment_info
            else
                error "前端部署失败！"
                exit 1
            fi
            ;;
        "all")
            log "开始全栈部署..."
            check_dependencies
            
            if deploy_backend && deploy_frontend; then
                success "全栈部署完成！"
                show_deployment_info
            else
                error "部署过程中出现错误！"
                show_status
                exit 1
            fi
            ;;
        *)
            error "未知选项: $deployment_type"
            show_help
            exit 1
            ;;
    esac
}

trap 'error "部署过程中发生错误，请检查日志"; exit 1' ERR

main "$@" 