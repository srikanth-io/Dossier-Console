#!/bin/bash
# Dossier Admin - Backend Services Manager
# Keeps all Supabase services running with auto-restart

set -e

PROJECT_NAME="Dossier_Admin"
CHECK_INTERVAL=10
MAX_RESTART_ATTEMPTS=5

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

declare -A RESTART_COUNTS

get_all_containers() {
    docker ps -a --filter "name=$PROJECT_NAME" --format "{{.Names}}" 2>/dev/null
}

get_running_containers() {
    docker ps --filter "name=$PROJECT_NAME" --format "{{.Names}}" 2>/dev/null
}

get_stopped_containers() {
    docker ps -a --filter "name=$PROJECT_NAME" --filter "status=exited" --format "{{.Names}}" 2>/dev/null
}

is_container_running() {
    local container=$1
    local status
    status=$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null || echo "false")
    [ "$status" = "true" ]
}

restart_container() {
    local container=$1
    local current_count=${RESTART_COUNTS[$container]:-0}
    
    if [ "$current_count" -ge "$MAX_RESTART_ATTEMPTS" ]; then
        log_error "$container exceeded max restart attempts ($MAX_RESTART_ATTEMPTS). Skipping."
        return 1
    fi
    
    log_warn "Restarting $container (attempt $((current_count + 1))/$MAX_RESTART_ATTEMPTS)..."
    docker start "$container" 2>/dev/null
    RESTART_COUNTS[$container]=$((current_count + 1))
    
    sleep 3
    
    if is_container_running "$container"; then
        log_success "$container restarted successfully"
        return 0
    else
        log_error "$container failed to restart"
        return 1
    fi
}

check_and_fix_services() {
    local stopped
    stopped=$(get_stopped_containers)
    
    if [ -z "$stopped" ]; then
        return 0
    fi
    
    while IFS= read -r container; do
        if [ -n "$container" ]; then
            restart_container "$container" || true
        fi
    done <<< "$stopped"
}

print_status() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  Dossier Admin - Service Status${NC}"
    echo -e "${CYAN}========================================${NC}"
    
    local running_count=0
    local total_count=0
    
    while IFS= read -r container; do
        if [ -n "$container" ]; then
            total_count=$((total_count + 1))
            if is_container_running "$container"; then
                running_count=$((running_count + 1))
                local short_name="${container##*_}"
                echo -e "  ${GREEN}✓${NC} $short_name"
            fi
        fi
    done <<< "$(get_all_containers)"
    
    echo -e "${CYAN}----------------------------------------${NC}"
    if [ "$running_count" -eq "$total_count" ]; then
        echo -e "  ${GREEN}All $total_count services running${NC}"
    else
        echo -e "  ${YELLOW}$running_count/$total_count services running${NC}"
    fi
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

show_endpoints() {
    echo -e "${CYAN}Endpoints:${NC}"
    echo "  Studio:    http://127.0.0.1:54323"
    echo "  API:       http://127.0.0.1:19001"
    echo "  Mailpit:   http://127.0.0.1:54324"
    echo "  Database:  postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    echo ""
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Dossier Admin - Service Manager       ║${NC}"
echo -e "${CYAN}║   Press Ctrl+C to stop monitoring        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

log_info "Starting Supabase services..."
npx supabase start 2>/dev/null || true

sleep 5

show_endpoints
print_status

log_info "Monitoring services (checking every ${CHECK_INTERVAL}s)..."

trap 'echo ""; log_info "Shutting down monitor..."; exit 0' INT TERM

while true; do
    sleep "$CHECK_INTERVAL"
    check_and_fix_services
    print_status
done
