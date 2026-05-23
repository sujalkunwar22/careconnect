#!/bin/bash

echo "=========================================="
echo "   Starting Care Connect Nepal (Nalina)   "
echo "        Frontend (Vercel Backend)         "
echo "=========================================="

echo "--> Target Backend: https://careconnect-snowy.vercel.app/api"
export EXPO_PUBLIC_API_URL="https://careconnect-snowy.vercel.app/api"

# Start the React Native / Expo Frontend
echo "--> Starting Frontend (Expo on port 8082)..."
cd frontend
npx expo start --port 8082 --clear
