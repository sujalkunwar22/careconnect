Write-Host "Starting Care Connect Nepal..." -ForegroundColor Green

Write-Host "Starting Backend (Django on port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 } elseif (Test-Path '.venv\Scripts\Activate.ps1') { .\.venv\Scripts\Activate.ps1 }; python manage.py runserver"

Write-Host "Starting Frontend (Expo on port 8082)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npx expo start --port 8082"

Write-Host "Both services have been started in separate windows!" -ForegroundColor Green
