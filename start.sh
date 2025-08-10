#!/usr/bin/env bash
set -Eeuo pipefail

# 一键启动前后端，并在当前终端持续显示“后端日志”
# 使用：
#   chmod +x start.sh
#   ./start.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/financial-analytics-platform"
BACKEND_DIR="$ROOT_DIR/financial-backend"

# 颜色与日志函数
GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; BLUE="\033[34m"; NC="\033[0m"
log()  { echo -e "${BLUE}[$(date '+%H:%M:%S')] $*${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] $*${NC}"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] $*${NC}" >&2; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || { err "缺少命令: $1，请先安装后再运行。"; exit 1; }; }

require_cmd node
require_cmd npm

# 基本校验
[ -d "$FRONTEND_DIR" ] || { err "未找到前端目录: $FRONTEND_DIR"; exit 1; }
[ -d "$BACKEND_DIR" ]   || { err "未找到后端目录: $BACKEND_DIR"; exit 1; }
[ -f "$BACKEND_DIR/app.js" ] || { err "后端入口文件缺失: $BACKEND_DIR/app.js"; exit 1; }

# 不自动安装依赖，仅提示（避免无意修改环境）
[ -d "$BACKEND_DIR/node_modules" ] || warn "后端依赖未安装，若启动失败请先手动执行: (cd financial-backend && npm install)"
[ -d "$FRONTEND_DIR/node_modules" ] || warn "前端依赖未安装，若启动失败请先手动执行: (cd financial-analytics-platform && npm install)"

# 清理与退出逻辑
PIDS=()
cleanup() {
  echo
  log "正在清理并关闭前后端进程..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  log "已退出。"
}
trap cleanup EXIT INT TERM

# 启动后端
log "启动后端 (financial-backend)..."
pushd "$BACKEND_DIR" >/dev/null

BACKEND_SCRIPT="start"
if npm run | grep -qE '^[[:space:]]*dev'; then
  BACKEND_SCRIPT="dev"
fi

mkdir -p logs
# 将后端日志加前缀输出，并写入 logs/dev.log
(
  npm run "$BACKEND_SCRIPT" 2>&1 \
    | sed -e 's/^/[BACKEND] /' \
    | tee -a logs/dev.log
) &
PIDS+=($!)
BACKEND_PID=$!

popd >/dev/null

# 启动前端（静默到当前终端，将日志写入前端 logs/dev.log）
log "启动前端 (financial-analytics-platform)..."
pushd "$FRONTEND_DIR" >/dev/null

FRONTEND_SCRIPT="dev"
mkdir -p logs 2>/dev/null || true
(
  npm run "$FRONTEND_SCRIPT" > logs/dev.log 2>&1
) &
PIDS+=($!)

popd >/dev/null

# 关键信息
log "前端开发服务器: http://localhost:8080 (Vite 默认端口)"
log "后端健康检查:   http://47.111.95.19:${PORT:-3000}/health"
echo
log "以下持续显示后端日志（按 Ctrl+C 退出并同时关闭前后端）："
echo

# 等待后端进程结束（期间日志会持续打印）
wait "$BACKEND_PID"

