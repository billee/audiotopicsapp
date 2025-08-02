# Mini Player Implementation

This document describes the mini player implementation for background audio playback in the Audio Topics app.

## Overview

The mini player provides a persistent, compact audio control interface that appears when audio is playing in the background. It allows users to control playback without navigating to the full audio player screen.

## Components

### 1. MiniPlayer Component (`MiniPlayer.tsx`)

The core UI component that renders the mini player interface.

**Features:**
- Compact design with topic info and essential controls
- Smooth animations for show/hide transitions
- Progress bar showing playback progress
- Play/pause, next/previous, and close controls
- Tap-to-expand functionality to navigate to full player
- Responsive design that adapts to different screen sizes

**Props:**
- `currentTopic`: Current audio topic being played
- `isPlaying`: Whether audio is currently playing
- `isVisible`: Controls visibility with animations
- `progress`: Playback progress (0-1)
- `onPlayPause`: Handler for play/pause button
- `onNext/onPrevious`: Handlers for skip controls
- `onExpand`: Handler for expanding to full player
- `onClose`: Handler for closing mini player
- `hasNextTrack/hasPreviousTrack`: Enable/disable skip buttons
- `canPlay`: Enable/disable play button

### 2. MiniPlayerContainer Component (`MiniPlayerContainer.tsx`)

Container component that connects the MiniPlayer to Redux store and audio player hooks.

**Responsibilities:**
- Connects to Redux store for audio state
- Integrates with `useAudioPlayer` hook for audio controls
- Integrates with `useMiniPlayer` hook for visibility management
- Handles navigation to full audio player
- Provides error handling for audio operations

### 3. useMiniPlayer Hook (`useMiniPlayer.ts`)

Custom hook that manages mini player visibility and state.

**Features:**
- Automatic show/hide based on audio playback state
- App state change handling (background/foreground)
- Integration with full player visibility
- Manual visibility controls

**Returns:**
- `isVisible`: Current visibility state
- `shouldShowMiniPlayer`: Whether mini player should be shown
- `showMiniPlayer/hideMiniPlayer/toggleMiniPlayer`: Manual controls

## Integration with Audio System

### Audio Service Integration

The mini player integrates with the audio system through:

1. **Redux Store**: Audio state management
2. **useAudioPlayer Hook**: Audio control actions
3. **NotificationService**: Lock screen controls
4. **react-native-track-player**: Background audio playback

### Notification Service Integration

The `NotificationService` provides lock screen controls that work alongside the mini player:

- **Lock Screen Controls**: Play/pause, next/previous buttons
- **Notification Panel**: Rich media notifications with artwork
- **Remote Control Events**: Headphone buttons, car controls
- **Background Audio Session**: Proper audio session management

## Usage

### Basic Integration

```tsx
import MiniPlayerContainer from './components/audio/MiniPlayerContainer';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Your main app content */}
      <NavigationContainer>
        {/* Your navigation stack */}
      </NavigationContainer>
      
      {/* Mini player overlay */}
      <MiniPlayerContainer />
    </View>
  );
};
```

### Custom Navigation Integration

```tsx
import MiniPlayerContainer from './components/audio/MiniPlayerContainer';

const App = () => {
  const navigation = useNavigation();
  
  const handleNavigateToPlayer = () => {
    navigation.navigate('AudioPlayer');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your main app content */}
      
      <MiniPlayerContainer 
        onNavigateToPlayer={handleNavigateToPlayer}
      />
    </View>
  );
};
```

## State Management

### Redux Integration

The mini player connects to the following Redux selectors:

- `selectCurrentTopic`: Current audio topic
- `selectIsPlaying`: Playback state
- `selectCanPlay`: Whether playback is possible
- `selectHasNextTrack/selectHasPreviousTrack`: Skip button states
- `selectPlaybackProgress`: Progress bar value

### Audio Player Actions

The mini player can trigger these audio actions:

- `togglePlayback()`: Play/pause audio
- `skipNext()`: Skip to next track
- `skipPrevious()`: Skip to previous track

## Styling and Theming

### Design System

The mini player follows the app's design system:

- **Colors**: Dark theme with blue accent
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Animations**: Smooth transitions using React Native Animated API

### Customization

The mini player can be customized through:

- **Style Props**: Pass custom styles to override defaults
- **Theme Integration**: Connect to your app's theme system
- **Icon Customization**: Replace default icons with custom ones

## Accessibility

### Screen Reader Support

- Proper accessibility labels for all interactive elements
- Semantic roles for buttons and controls
- State announcements for play/pause changes

### Keyboard Navigation

- Tab navigation support
- Keyboard shortcuts for common actions
- Focus management

### Touch Targets

- Minimum 44pt touch targets for all buttons
- Proper spacing between interactive elements
- Visual feedback for touch interactions

## Testing

### Unit Tests

- Component rendering tests
- User interaction tests
- State management tests
- Animation tests

### Integration Tests

- Redux store integration
- Audio player hook integration
- Navigation integration

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation
- Touch target sizes

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use React.memo for expensive renders
2. **Animation Performance**: Use native driver for animations
3. **State Updates**: Minimize unnecessary re-renders
4. **Memory Management**: Proper cleanup of listeners and timers

### Battery Optimization

1. **Background Processing**: Minimize CPU usage when backgrounded
2. **Network Efficiency**: Batch network requests
3. **Screen Wake**: Proper wake lock management

## Requirements Fulfilled

This implementation fulfills the following requirements from the spec:

### Requirement 3.6
✅ **Background Playback**: Mini player appears during background playback

### Requirement 3.7  
✅ **Notification Controls**: Integration with lock screen controls via NotificationService

### Requirement 4.5
✅ **Lock Screen Controls**: Proper audio session management and remote control events

## Future Enhancements

### Potential Improvements

1. **Gesture Support**: Swipe gestures for skip/dismiss
2. **Queue Management**: Show upcoming tracks
3. **Lyrics Integration**: Display synchronized lyrics
4. **Social Features**: Share currently playing track
5. **Customizable Controls**: User-configurable button layout

### Advanced Features

1. **Picture-in-Picture**: Video content support
2. **Multi-room Audio**: AirPlay/Chromecast integration
3. **Voice Control**: Siri/Google Assistant integration
4. **Car Integration**: Android Auto/CarPlay support

## Troubleshooting

### Common Issues

1. **Mini Player Not Showing**: Check audio state and visibility logic
2. **Controls Not Working**: Verify Redux store connection
3. **Animation Issues**: Check native driver usage
4. **Background Audio**: Verify audio session configuration

### Debug Tools

1. **Redux DevTools**: Monitor state changes
2. **React Native Debugger**: Component inspection
3. **Audio Service Logs**: Track audio operations
4. **Notification Service State**: Check lock screen integration