@echo off
echo Starting Care Connect Nepal...

echo Starting Backend (Django on port 8000)...
start "Care Connect Backend" cmd /k "cd backend && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && (if exist .venv\Scripts\activate.bat call .venv\Scripts\activate.bat) && python manage.py runserver"

echo Starting Frontend (Expo on port 8082)...
start "Care Connect Frontend" cmd /k "cd frontend && npx expo start --port 8082 --clear"

echo Both services have been started in separate windows!
