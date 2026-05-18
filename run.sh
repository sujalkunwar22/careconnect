#!/bin/bash

echo "=========================================="
echo "   Starting Care Connect Nepal (Nalina)   "
echo "=========================================="

# Detect Operating System
OS_TYPE="$(uname)"

if [ "$OS_TYPE" = "Darwin" ]; then
    echo "macOS detected! Launching services in separate Terminal windows..."

    # Determine Python command to use for macOS
    PYTHON_CMD="python"
    if [ ! -f "backend/venv/bin/activate" ] && [ ! -f "backend/.venv/bin/activate" ]; then
        if command -v python3 >/dev/null 2>&1; then
            PYTHON_CMD="python3"
        fi
    fi

    # 1. Start the Django Backend in a new Terminal window
    echo "--> Launching Backend (Django on port 8000) in new window..."
    osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)/backend' && if [ -f 'venv/bin/activate' ]; then source venv/bin/activate; elif [ -f '.venv/bin/activate' ]; then source .venv/bin/activate; fi && $PYTHON_CMD manage.py runserver 0.0.0.0:8000\""

    # 2. Start the React Native / Expo Frontend in a new Terminal window
    echo "--> Launching Frontend (Expo on port 8082) in new window..."
    osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)/frontend' && npx expo start --port 8082 --clear\""

    echo "=========================================="
    echo "   Both services successfully launched!  "
    echo "=========================================="
else
    # Fallback/Default behavior for Linux/Unix and Git Bash on Windows
    echo "Non-macOS platform detected ($OS_TYPE). Running services in background..."

    # Start the Django backend in the background
    echo "--> Starting Backend (Django on port 8000)..."
    cd backend
    
    PYTHON_CMD="python"
    VENV_ACTIVATED=false
    
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        VENV_ACTIVATED=true
    elif [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
        VENV_ACTIVATED=true
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
        VENV_ACTIVATED=true
    elif [ -f ".venv/Scripts/activate" ]; then
        source .venv/Scripts/activate
        VENV_ACTIVATED=true
    fi
    
    # If no virtual environment was activated, check if python3 exists on the system
    if [ "$VENV_ACTIVATED" = false ]; then
        if command -v python3 >/dev/null 2>&1; then
            PYTHON_CMD="python3"
        fi
    fi
    
    $PYTHON_CMD manage.py runserver 0.0.0.0:8000 &
    BACKEND_PID=$!

    # Start the React Native / Expo frontend in the foreground
    echo "--> Starting Frontend (Expo on port 8082)..."
    cd ../frontend
    npx expo start --port 8082 --clear 

    # When frontend stops, kill backend as well
    kill $BACKEND_PID 2>/dev/null || true
fi



