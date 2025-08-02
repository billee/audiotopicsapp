@echo off
echo 🚀 Testing Navigation Setup
echo ========================

echo 📱 Starting Metro bundler...
start "Metro" cmd /k "npx react-native start"

echo ⏳ Waiting 5 seconds for Metro to start...
timeout /t 5 /nobreak > nul

echo 🔨 Building and running on Android...
npx react-native run-android

echo.
echo 📋 What to Test:
echo ================
echo 1. App should show 6 category cards
echo 2. Tap any category - should navigate to topic list
echo 3. Tap any topic - should navigate to audio player
echo 4. In audio player, tap play button
echo 5. Navigate back - mini player should appear
echo.
echo 🐛 If categories don't navigate:
echo - Check Metro console for errors
echo - Look for "Cannot read property 'navigate'" errors
echo - Try restarting Metro bundler
echo.
pause