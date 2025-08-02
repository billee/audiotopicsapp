@echo off
REM Script to test the Audio Topics app with Mini Player on Android device

echo 🎵 Audio Topics App - Android Testing Script
echo =============================================

REM Check if Android device is connected
echo 📱 Checking for connected Android devices...
adb devices

REM Check if adb is available
where adb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ADB not found. Please install Android SDK Platform Tools
    echo    Download from: https://developer.android.com/studio/releases/platform-tools
    pause
    exit /b 1
)

echo ✅ ADB found, checking for devices...

REM Build and install the app
echo.
echo 🔨 Building and installing the app...
cd /d "%~dp0\.."

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npx react-native clean

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build and run on Android
echo 🚀 Building and running on Android device...
call npx react-native run-android

echo.
echo 📋 Testing Checklist for Mini Player:
echo ======================================
echo □ 1. Start playing an audio topic
echo □ 2. Navigate away from the audio player screen
echo □ 3. Verify mini player appears at bottom
echo □ 4. Test play/pause button in mini player
echo □ 5. Test next/previous buttons (if available)
echo □ 6. Test tap-to-expand functionality
echo □ 7. Test close button
echo □ 8. Put app in background - verify audio continues
echo □ 9. Check notification panel for media controls
echo □ 10. Test lock screen controls
echo □ 11. Test headphone button controls (if available)
echo.
echo 🐛 If you encounter issues:
echo - Check logcat: adb logcat ^| findstr /i audio
echo - Check React Native logs in Metro bundler
echo - Verify audio permissions are granted
echo.
echo Happy testing! 🎧
pause