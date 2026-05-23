Write-Host "Starting Care Connect Nepal (Frontend Only)..." -ForegroundColor Green
Write-Host "Target Backend: https://careconnect-snowy.vercel.app/api" -ForegroundColor Yellow

$env:EXPO_PUBLIC_API_URL="https://careconnect-snowy.vercel.app/api"

Write-Host "Starting Frontend (Expo on port 8082)..." -ForegroundColor Cyan
cd frontend
npx expo start --port 8082 --clear
