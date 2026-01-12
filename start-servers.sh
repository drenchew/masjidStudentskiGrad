#!/usr/bin/env bash

# start-servers.sh - simplified startup helper for development
# - builds and launches backend (jar or mvn) and frontend (vite dev)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Masjid Studentski Grad development servers"

# Simple waiter for TCP ports using lsof (returns 0 if port is listening)
wait_for_port() {
    local port=$1
    local timeout=${2:-20}
    local waited=0
    while ! lsof -Pi :${port} -sTCP:LISTEN -t >/dev/null 2>&1; do
        sleep 1
        waited=$((waited + 1))
        if [ $waited -ge $timeout ]; then
            return 1
        fi
    done
    return 0
}

# Load all .env files (project, backend, frontend) if present
echo "Loading .env files (if present): $PROJECT_ROOT/.env, $PROJECT_ROOT/backend/.env, $PROJECT_ROOT/frontend/.env"
set -a
if [ -f "$PROJECT_ROOT/.env" ]; then
    # shellcheck disable=SC1090
    source "$PROJECT_ROOT/.env"
fi
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    # shellcheck disable=SC1090
    source "$PROJECT_ROOT/backend/.env"
fi
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    # shellcheck disable=SC1090
    source "$PROJECT_ROOT/frontend/.env"
fi
set +a

echo "Checking required tools..."
command -v mvn >/dev/null 2>&1 || echo "Warning: mvn not found in PATH"
command -v npm >/dev/null 2>&1 || echo "Warning: npm not found in PATH"
command -v java >/dev/null 2>&1 || echo "Warning: java not found in PATH (jar execution may fail)"

echo "Rebuilding backend (always)..."
mkdir -p /tmp
BACKEND_BUILD_LOG=/tmp/masjid-backend-build.log
if (cd "$PROJECT_ROOT/backend" && mvn -DskipTests package 2>&1 | tee "$BACKEND_BUILD_LOG"); then
    echo "Backend build completed successfully (log: $BACKEND_BUILD_LOG)"
else
    echo "Backend build failed. See $BACKEND_BUILD_LOG"
    tail -n 80 "$BACKEND_BUILD_LOG" || true
    echo "Aborting startup due to backend build failure."
    exit 1
fi

echo "Starting backend..."
cd "$PROJECT_ROOT/backend"
JAR_FILE=$(ls target/*.jar 2>/dev/null | grep -v '\.original\.jar' | head -n 1 || true)
BACKEND_RUN_LOG=/tmp/masjid-backend.log
if [ -n "$JAR_FILE" ] && command -v java >/dev/null 2>&1; then
    echo "Launching jar: $JAR_FILE (logs: $BACKEND_RUN_LOG)"
    nohup java -jar "$JAR_FILE" >"$BACKEND_RUN_LOG" 2>&1 &
    BACKEND_PID=$!
else
    echo "Jar not found or java missing — launching via Maven (mvn spring-boot:run) (logs: $BACKEND_RUN_LOG)"
    nohup mvn spring-boot:run >"$BACKEND_RUN_LOG" 2>&1 &
    BACKEND_PID=$!
fi
echo "Backend PID: $BACKEND_PID"

echo "Waiting for backend on port 8080..."
if wait_for_port 8080 40; then
    echo "Backend is listening on port 8080"
else
    echo "Backend did not appear on port 8080 within timeout; check $BACKEND_RUN_LOG"
fi

echo "Rebuilding frontend (always)..."
FRONTEND_BUILD_LOG=/tmp/masjid-frontend-build.log
FRONTEND_NPM_CI_LOG=/tmp/masjid-frontend-npm-ci.log
cd "$PROJECT_ROOT/frontend"
echo "Installing frontend dependencies (npm ci) — log: $FRONTEND_NPM_CI_LOG"
if npm ci 2>&1 | tee "$FRONTEND_NPM_CI_LOG"; then
    echo "npm ci completed"
else
    echo "npm ci failed (see $FRONTEND_NPM_CI_LOG), trying 'npm install'"
    npm install 2>&1 | tee "$FRONTEND_NPM_CI_LOG" || echo "npm install also failed; continuing"
fi

echo "Running frontend build (npm run build) — log: $FRONTEND_BUILD_LOG"
if npm run build 2>&1 | tee "$FRONTEND_BUILD_LOG"; then
    echo "Frontend build completed"
else
    echo "Frontend build failed (see $FRONTEND_BUILD_LOG). Continuing to start dev server."
fi

echo "Starting frontend (vite dev) — logs: /tmp/masjid-frontend.log"
FRONTEND_RUN_LOG=/tmp/masjid-frontend.log
nohup npm run dev >"$FRONTEND_RUN_LOG" 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "Waiting for frontend on port 5173..."
if wait_for_port 5173 40; then
    echo "Frontend is listening on port 5173"
else
    echo "Frontend did not appear on port 5173 within timeout; check $FRONTEND_RUN_LOG"
fi

echo "Servers launched. Backend: http://localhost:8080  Frontend: http://localhost:5173"

# Save PIDs
echo "$BACKEND_PID" > /tmp/masjid-backend.pid
echo "$FRONTEND_PID" > /tmp/masjid-frontend.pid

echo "Build logs:"
echo "  Backend build: $BACKEND_BUILD_LOG"
echo "  Frontend build: $FRONTEND_BUILD_LOG"
echo "Runtime logs:"
echo "  Backend runtime: $BACKEND_RUN_LOG"
echo "  Frontend runtime: $FRONTEND_RUN_LOG"

echo "Tailing runtime logs (press Ctrl+C to stop monitoring)"
tail -f "$BACKEND_RUN_LOG" "$FRONTEND_RUN_LOG"
