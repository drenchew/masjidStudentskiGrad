#!/usr/bin/env bash

# Masjid Studentski Grad - Stop Development Servers Script
# Performs graceful shutdown of backend/frontend started by start-servers.sh

set -euo pipefail

echo "🛑 Stopping Masjid Studentski Grad Development Servers"
echo "======================================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

graceful_kill() {
    local pid=$1
    local name=${2:-}
    if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
        return 1
    fi
    echo "Stopping ${name} (PID: $pid) ..."
    kill "$pid" 2>/dev/null || true
    # Wait up to 8 seconds
    for i in {1..8}; do
        if ! kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ ${name} stopped${NC}"
            return 0
        fi
        sleep 1
    done
    echo "${name} did not stop, sending SIGKILL..."
    kill -9 "$pid" 2>/dev/null || true
    sleep 1
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${GREEN}✅ ${name} killed${NC}"
        return 0
    else
        echo -e "${RED}❌ Could not kill ${name} (PID: $pid)${NC}"
        return 2
    fi
}

# Stop backend by PID file
if [ -f /tmp/masjid-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/masjid-backend.pid)
    if graceful_kill "$BACKEND_PID" "Backend"; then
        rm -f /tmp/masjid-backend.pid
    fi
else
    echo "⚠️  Backend PID file not found"
fi

echo ""

# Stop frontend by PID file
if [ -f /tmp/masjid-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/masjid-frontend.pid)
    if graceful_kill "$FRONTEND_PID" "Frontend"; then
        rm -f /tmp/masjid-frontend.pid
    fi
else
    echo "⚠️  Frontend PID file not found"
fi

echo ""
echo "Cleaning up any remaining common processes..."

# Fallback: try to terminate known processes (spring boot, vite, node)
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "java -jar" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "node .*vite" 2>/dev/null || true

# Remove build logs older than 7 days (keep recent logs)
find /tmp -maxdepth 1 -type f -name "masjid-*-build.log" -mtime +7 -print -delete 2>/dev/null || true

# If a temporary DB init log exists, show brief info and remove it
if [ -f /tmp/masjid-db-init.log ]; then
    echo ""
    echo "📦 Found DB init log at /tmp/masjid-db-init.log (created by start-servers)."
    echo "   Removing temporary log file..."
    rm -f /tmp/masjid-db-init.log
fi

echo ""
echo "======================================================="
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo "======================================================="
