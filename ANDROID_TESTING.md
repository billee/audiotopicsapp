# Android Testing Guide for Mini Player

This guide will help you test the mini player functionality on an Android device.

## Prerequisites

### 1. Development Environment Setup

Ensure you have the following installed:
- **Android Studio** with Android SDK
- **Node.js** (v16 or higher)
- **React Native CLI**: `npm install -g react-native-cli`
- **ADB (Android Debug Bridge)** - comes with Android SDK

### 2. Android Device Setup

1. **Enable Developer Options**:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Developer Options will appear in Settings

2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"
   - Connect device via USB and accept debugging prompt

3. **Verify Connection**:
   ```bash
   adb devices
   ```
   Should show your device listed as "device" (not "unauthorized")

## Running the App

### Option 1: Using the Test Script (Recommended)

```bash
# Navigate to the project directory
cd AudioTopicsApp

# Run the Windows test script
scripts\test-android.bat
```

### Option 2: Manual Steps

```bash
# Navigate to project directory
cd AudioTopicsApp

# Install dependencies
npm install

# Clean previous builds
npx react-native clean

# Start Metro bundler (in one terminal)
npx react-native start

# Build and run on Android (in another terminal)
npx react-native run-android
```

## Testing the Mini Player

### Core Functionality Tests

#### 1. Basic Playback Test
- [ ] Open the app
- [ ] Navigate to a topic and start playing audio
- [ ] Verify audio plays correctly
- [ ] Navigate back to main screen
- [ ] **Expected**: Mini player should appear at bottom

#### 2. Mini Player Controls Test
- [ ] **Play/Pause Button**: Tap to pause/resume audio
- [ ] **Progress Bar**: Should show current playback progress
- [ ] **Topic Info**: Should display current topic title and author
- [ ] **Next/Previous**: Test skip buttons (if playlist has multiple items)
- [ ] **Close Button**: Should hide mini player and stop audio

#### 3. Expand Functionality Test
- [ ] Tap on the topic info area in mini player
- [ ] **Expected**: Should navigate to full audio player screen
- [ ] Verify full player shows same audio state
- [ ] Navigate away from full player
- [ ] **Expected**: Mini player should reappear

### Background Playback Tests

#### 4. App Backgrounding Test
- [ ] Start audio playback
- [ ] Press home button to background the app
- [ ] **Expected**: Audio should continue playing
- [ ] **Expected**: Notification should appear in notification panel
- [ ] Return to app
- [ ] **Expected**: Mini player should still be visible and functional

#### 5. Notification Controls Test
- [ ] With audio playing, pull down notification panel
- [ ] **Expected**: Should see media notification with:
  - Topic title and author
  - Album artwork (if available)
  - Play/pause button
  - Next/previous buttons
  - Progress indicator
- [ ] Test notification controls:
  - [ ] Play/pause from notification
  - [ ] Skip next/previous from notification
  - [ ] Tap notification to open app

#### 6. Lock Screen Controls Test
- [ ] Start audio playback
- [ ] Lock the device screen
- [ ] **Expected**: Should see media controls on lock screen
- [ ] Test lock screen controls:
  - [ ] Play/pause
  - [ ] Skip next/previous
  - [ ] Unlock and verify app state matches

### Advanced Tests

#### 7. Hardware Button Test (if available)
- [ ] Connect wired headphones with media buttons
- [ ] Test headphone button controls:
  - [ ] Single press: Play/pause
  - [ ] Double press: Skip next
  - [ ] Triple press: Skip previous

#### 8. Bluetooth Controls Test (if available)
- [ ] Connect Bluetooth headphones/speaker with media controls
- [ ] Test Bluetooth media button controls
- [ ] Verify audio routing to Bluetooth device

#### 9. Phone Call Interruption Test
- [ ] Start audio playback
- [ ] Receive or make a phone call
- [ ] **Expected**: Audio should pause during call
- [ ] End call
- [ ] **Expected**: Audio should resume (or show resume option)

#### 10. Multiple App Test
- [ ] Start audio in your app
- [ ] Open another audio app (YouTube, Spotify, etc.)
- [ ] Start audio in the other app
- [ ] **Expected**: Your app's audio should pause
- [ ] Return to your app
- [ ] **Expected**: Mini player should show paused state

## Troubleshooting

### Common Issues and Solutions

#### App Won't Install
```bash
# Clear app data and reinstall
adb uninstall com.audiotopicsapp
npx react-native run-android
```

#### Audio Not Playing
- Check device volume levels
- Verify audio permissions in app settings
- Check if device is in silent/do-not-disturb mode

#### Mini Player Not Appearing
- Check Redux store state in React Native debugger
- Verify audio is actually playing
- Check console logs for JavaScript errors

#### Background Audio Not Working
- Verify Android manifest permissions
- Check if battery optimization is disabled for the app
- Ensure foreground service is properly configured

#### Notification Controls Not Working
- Check notification permissions in Android settings
- Verify media session is properly initialized
- Check if notification channels are created (Android 8+)

### Debug Commands

#### View App Logs
```bash
# Filter for your app's logs
adb logcat | findstr "AudioTopicsApp"

# Filter for audio-related logs
adb logcat | findstr /i "audio"

# Filter for media session logs
adb logcat | findstr "MediaSession"
```

#### Check App Permissions
```bash
# List all permissions for your app
adb shell dumpsys package com.audiotopicsapp | findstr permission
```

#### Monitor Audio Focus
```bash
# Monitor audio focus changes
adb logcat | findstr "AudioFocus"
```

## Performance Testing

### Battery Usage Test
1. Start audio playback
2. Background the app for 30 minutes
3. Check battery usage in Android Settings > Battery
4. Verify reasonable battery consumption

### Memory Usage Test
1. Use Android Studio's Memory Profiler
2. Monitor memory usage during:
   - Normal playback
   - Background playback
   - Mini player interactions
3. Look for memory leaks or excessive usage

### Network Usage Test
1. Monitor network usage during streaming
2. Test behavior with poor network conditions
3. Verify proper error handling for network issues

## Expected Behavior Summary

### ✅ What Should Work
- Mini player appears when audio starts and user navigates away
- All mini player controls function correctly
- Background audio playback continues when app is backgrounded
- Notification controls work in notification panel
- Lock screen controls are functional
- Audio focus is properly managed with other apps
- Smooth animations and responsive UI

### ⚠️ Known Limitations
- Some Android versions may have different notification behavior
- Battery optimization settings may affect background playback
- Bluetooth audio latency may vary by device
- Some custom Android ROMs may have audio focus issues

## Reporting Issues

When reporting issues, please include:
1. **Device Info**: Model, Android version, manufacturer
2. **Steps to Reproduce**: Exact steps that cause the issue
3. **Expected vs Actual**: What should happen vs what actually happens
4. **Logs**: Relevant logcat output
5. **Screenshots/Video**: Visual evidence of the issue

## Success Criteria

The mini player implementation is successful if:
- ✅ All core functionality tests pass
- ✅ Background playback works reliably
- ✅ Notification and lock screen controls function
- ✅ No crashes or memory leaks during testing
- ✅ Good performance and battery usage
- ✅ Proper integration with Android's audio system

Happy testing! 🎧📱