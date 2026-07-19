#!/bin/bash

BASE_DIR="/c/Users/rajat/OneDrive/Desktop/New-folder--5--main"

echo "Starting all servers..."
echo "======================"

# Start admin-hub-plus-main (Frontend - Vite on port 5173)
echo "Starting admin-hub-plus-main..."
cd "$BASE_DIR/admin-hub-plus-main"
npm run dev &
ADMIN_HUB_PID=$!

# Start backend-admin (Backend on port 5000)
echo "Starting backend-admin..."
cd "$BASE_DIR/backend-admin"
npm run dev &
BACKEND_ADMIN_PID=$!

# Start damoder-backend-main (Backend on port 5000)
echo "Starting damoder-backend-main..."
cd "$BASE_DIR/damoder-backend-main"
npm run dev &
DAMODER_BACKEND_PID=$!

# Start damoder-frontend-main (Frontend - Vite on port 5173)
echo "Starting damoder-frontend-main..."
cd "$BASE_DIR/damoder-frontend-main"
npm run dev &
DAMODER_FRONTEND_PID=$!

echo "======================"
echo "All servers starting..."
echo ""
echo "Process IDs:"
echo "  admin-hub-plus-main: $ADMIN_HUB_PID"
echo "  backend-admin: $BACKEND_ADMIN_PID"
echo "  damoder-backend-main: $DAMODER_BACKEND_PID"
echo "  damoder-frontend-main: $DAMODER_FRONTEND_PID"
echo ""
echo "Expected URLs:"
echo "  admin-hub-plus-main: http://localhost:5173"
echo "  backend-admin: Check logs for port"
echo "  damoder-backend-main: Check logs for port"
echo "  damoder-frontend-main: http://localhost:5173 (or 5174)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for all processes
wait
