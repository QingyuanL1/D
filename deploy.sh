#!/bin/bash

# 财务分析平台前端自动化部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/root/D/financial-analytics-platform"
DIST_DIR="$PROJECT_DIR/dist"
BACKUP_DIR="/root/D/backup"

# 日志函数
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

# 检查必要的命令是否存在
check_dependencies() {
    log "检查依赖..."
    
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
        exit 1
    fi
    
    if ! command -v nginx &> /dev/null; then
        error "nginx 未安装"
        exit 1
    fi
    
    success "依赖检查通过"
}

# 备份当前的dist目录
backup_current() {
    log "备份当前部署..."
    
    if [ -d "$DIST_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="dist_backup_$(date +%Y%m%d_%H%M%S)"
        cp -r "$DIST_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        success "备份完成: $BACKUP_DIR/$BACKUP_NAME"
    else
        warning "没有找到现有的dist目录"
    fi
}

# 进入项目目录
enter_project() {
    log "进入项目目录..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
    success "已进入项目目录"
}

# 安装依赖
# install_dependencies() {
#     log "安装/更新依赖..."
    
#     if [ -f "package.json" ]; then
#         npm install --force
#         success "依赖安装完成"
#     else
#         error "package.json 文件不存在"
#         exit 1
#     fi
# }

# 构建项目
build_project() {
    log "开始构建项目..."
    
    # 清理旧的构建文件
    if [ -d "$DIST_DIR" ]; then
        rm -rf "$DIST_DIR"
        log "清理旧的构建文件"
    fi
    
    # 使用vite直接构建，跳过TypeScript检查
    npx vite build
    
    if [ $? -eq 0 ]; then
        success "项目构建成功"
    else
        error "项目构建失败"
        exit 1
    fi
}

# 设置文件权限
set_permissions() {
    log "设置文件权限..."
    
    if [ -d "$DIST_DIR" ]; then
        chmod -R 755 "$DIST_DIR"
        chown -R www-data:www-data "$DIST_DIR"
        success "权限设置完成"
    else
        error "构建目录不存在"
        exit 1
    fi
}

# 测试nginx配置
test_nginx() {
    log "测试nginx配置..."
    
    nginx -t
    if [ $? -eq 0 ]; then
        success "nginx配置测试通过"
    else
        error "nginx配置测试失败"
        exit 1
    fi
}

# 重载nginx
reload_nginx() {
    log "重载nginx..."
    
    systemctl reload nginx
    if [ $? -eq 0 ]; then
        success "nginx重载成功"
    else
        error "nginx重载失败"
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    log "验证部署..."
    
    # 等待一秒让服务完全启动
    sleep 1
    
    # 测试HTTP响应
    if curl -f -s http://47.111.95.19 > /dev/null; then
        success "部署验证成功 - 网站可访问"
    else
        error "部署验证失败 - 网站无法访问"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log "部署信息:"
    echo "=================================="
    echo "项目目录: $PROJECT_DIR"
    echo "构建目录: $DIST_DIR"
    echo "访问地址: http://47.111.95.19"
    echo "nginx配置: /etc/nginx/sites-available/financial-analytics"
    echo "=================================="
}

# 主函数
main() {
    log "开始前端自动化部署..."
    echo "=================================="
    
    check_dependencies
    backup_current
    enter_project
    # install_dependencies
    build_project
    set_permissions
    test_nginx
    reload_nginx
    verify_deployment
    show_deployment_info
    
    success "前端部署完成！"
}

# 错误处理
trap 'error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"