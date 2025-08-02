#!/bin/bash

# Script to test the Audio Topics app with Mini Player on Android device

echo "🎵 Audio Topics App - Android Testing Script"
echo "============================================="

# Check if Android device is connected
echo "📱 Checking for connected Android devices..."
adb devices

# Check if any devices are connected
DEVICE_COUNT=$(adb devices | grep -v "List of devices attached" | grep -c "device")

if [ $DEVICE_COUNT -eq 0 ]; then
    echo "❌ No Android devices found. Please:"
    echo "   1. Connect your Android device via USB"
    echo "   2. Enable USB Debugging in Developer Options"
    echo "   3. Accept the USB debugging prompt on your device"
    exit 1
fi

echo "✅ Found $DEVICE_COUNT Android device(s)"

# Build and install the app
echo ""
echo "🔨 Building and installing the app..."
cd "$(dirname "$0")/.."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npx react-native clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build and run on Android
echo "🚀 Building and running on Android device..."
npx react-native run-android

echo ""
echo "📋 Testing Checklist for Mini Player:"
echo "======================================"
echo "□ 1. Start playing an audio topic"
echo "□ 2. Navigate away from the audio player screen"
echo "□ 3. Verify mini player appears at bottom"
echo "□ 4. Test play/pause button in mini player"
echo "□ 5. Test next/previous buttons (if available)"
echo "□ 6. Test tap-to-expand functionality"
echo "□ 7. Test close button"
echo "□ 8. Put app in background - verify audio continues"
echo "□ 9. Check notification panel for media controls"
echo "□ 10. Test lock screen controls"
echo "□ 11. Test headphone button controls (if available)"
echo ""
echo "🐛 If you encounter issues:"
echo "- Check logcat: adb logcat | grep -i audio"
echo "- Check React Native logs in Metro bundler"
echo "- Verify audio permissions are granted"
echo ""
echo "Happy testing! 🎧"