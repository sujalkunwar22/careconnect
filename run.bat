@echo off
echo Starting Care Connect Nepal (Frontend Only)...
echo Target Backend: https://careconnect-snowy.vercel.app/api

set EXPO_PUBLIC_API_URL=https://careconnect-snowy.vercel.app/api

echo Starting Frontend (Expo on port 8082)...
cd frontend
npx expo start --port 8082 --clear
