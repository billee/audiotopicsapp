# Audio Dependencies Setup Guide

To fully test the mini player with background audio on Android, you'll need to install additional audio-related dependencies.

## Required Dependencies

### 1. React Native Track Player (Recommended)

This is the most popular and robust solution for background audio in React Native:

```bash
npm install react-native-track-player
```

**Android Setup:**
```bash
# For React Native 0.60+, auto-linking should work
# If you encounter issues, manually link:
npx react-native link react-native-track-player
```

### 2. Alternative: React Native Sound

If you prefer a simpler audio solution:

```bash
npm install react-native-sound
```

### 3. Additional Useful Dependencies

```bash
# For better audio control and media session management
npm install @react-native-community/audio-toolkit

# For handling audio focus and interruptions
npm install react-native-audio-focus
```

## Configuration Steps

### Step 1: Update Android Manifest

The `AndroidManifest.xml` has already been updated with necessary permissions. If you need to add more:

```xml
<!-- Add to android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Step 2: Update AudioService Implementation

Update `src/services/AudioService.ts` to use react-native-track-player:

```typescript
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  Track,
} from 'react-native-track-player';

class AudioService {
  async initialize() {
    await TrackPlayer.setupPlayer();
    
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
  }

  async loadTrack(topic: AudioTopic) {
    const track: Track = {
      id: topic.id,
      url: topic.audioUrl,
      title: topic.title,
      artist: topic.author || 'Unknown Artist',
      artwork: topic.thumbnailUrl,
      duration: topic.duration,
    };

    await TrackPlayer.add(track);
  }

  async play() {
    await TrackPlayer.play();
  }

  async pause() {
    await TrackPlayer.pause();
  }

  // ... other methods
}
```

### Step 3: Create Track Player Service (Android)

Create `android/app/src/main/java/com/audiotopicsapp/TrackPlayerService.java`:

```java
package com.audiotopicsapp;

import com.doublesymmetry.trackplayer.service.MusicService;

public class TrackPlayerService extends MusicService {
    // This class can be empty, it just needs to extend MusicService
}
```

### Step 4: Update MainApplication.java

Add to `android/app/src/main/java/com/audiotopicsapp/MainApplication.java`:

```java
import com.doublesymmetry.trackplayer.TrackPlayerPackage;

// In the getPackages() method, add:
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new TrackPlayerPackage()
    );
}
```

## Testing Without Full Audio Implementation

If you want to test the mini player UI without implementing full background audio, you can:

### Option 1: Mock Audio Service

Create a mock implementation that simulates audio playback:

```typescript
// src/services/MockAudioService.ts
class MockAudioService {
  private isPlaying = false;
  private position = 0;
  private duration = 0;
  private interval: NodeJS.Timeout | null = null;

  async play() {
    this.isPlaying = true;
    this.startPositionUpdates();
  }

  async pause() {
    this.isPlaying = false;
    this.stopPositionUpdates();
  }

  private startPositionUpdates() {
    this.interval = setInterval(() => {
      if (this.isPlaying && this.position < this.duration) {
        this.position += 1;
      }
    }, 1000);
  }

  private stopPositionUpdates() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // ... other mock methods
}
```

### Option 2: Use HTML5 Audio (Limited)

For basic testing, you can use React Native's built-in audio capabilities:

```typescript
// This won't provide background playback but allows UI testing
import { Audio } from 'expo-av'; // If using Expo
// or
import Sound from 'react-native-sound'; // If using react-native-sound
```

## Quick Start for Testing

If you want to quickly test the mini player without full audio setup:

1. **Install minimal dependencies:**
   ```bash
   npm install react-native-sound
   ```

2. **Use the mock service** provided above

3. **Run the test script:**
   ```bash
   scripts\test-android.bat
   ```

4. **Test mini player UI** (audio may not work in background, but UI should function)

## Full Production Setup

For a production-ready implementation:

1. **Install react-native-track-player**
2. **Configure all Android permissions and services**
3. **Implement proper error handling**
4. **Add audio focus management**
5. **Test on multiple Android versions**
6. **Optimize for battery usage**

## Troubleshooting

### Common Issues:

1. **"Module not found" errors**: Ensure dependencies are properly installed and linked
2. **Audio not playing**: Check Android permissions and audio focus
3. **Background audio stops**: Verify foreground service configuration
4. **Notification not showing**: Check notification permissions and channels

### Debug Steps:

1. Check Metro bundler logs
2. Check Android logcat: `adb logcat | findstr audio`
3. Verify permissions in Android settings
4. Test on different Android versions

## Next Steps

1. Choose your audio implementation approach
2. Install necessary dependencies
3. Update AudioService implementation
4. Test on Android device
5. Iterate based on test results

The mini player UI is already implemented and ready to work with any audio backend you choose!