# Design Document

## Overview

This design transforms the current topic list experience from a navigation-based audio player to an inline audio control system. Instead of navigating to a separate AudioPlayerScreen, users will interact with play/pause/stop controls directly within each topic row. The design leverages existing audio infrastructure while creating a new inline audio management system.

## Architecture

### Component Architecture

```
TopicListScreen (Modified)
├── InlineAudioProvider (New)
│   ├── Audio State Management
│   ├── Single Audio Instance Control
│   └── Progress Tracking
├── TopicRow (New Component)
│   ├── TopicInfo (Title, Duration)
│   ├── InlineAudioControls (New)
│   │   ├── PlayButton
│   │   ├── PauseButton
│   │   ├── StopButton
│   │   └── ProgressIndicator
│   └── Visual State Indicators
└── ScrollView (Enhanced)
    └── Multiple TopicRow instances
```

### Audio Management Architecture

```
InlineAudioManager (New Service)
├── Single Audio Instance
├── State Management
│   ├── currentPlayingTopic
│   ├── playbackState
│   └── progressTracking
├── Control Methods
│   ├── playTopic()
│   ├── pauseAudio()
│   ├── stopAudio()
│   └── switchTopic()
└── Event Handling
    ├── onPlaybackComplete
    ├── onError
    └── onProgressUpdate
```

## Components and Interfaces

### 1. InlineAudioProvider

**Purpose:** Context provider for managing audio state across all topic rows

```typescript
interface InlineAudioState {
  currentPlayingTopic: string | null;
  playbackState: 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';
  progress: number;
  duration: number;
  error: string | null;
}

interface InlineAudioActions {
  playTopic: (topicId: string, audioUrl: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  resetError: () => void;
}
```

### 2. TopicRow Component

**Purpose:** Individual topic row with inline audio controls

```typescript
interface TopicRowProps {
  topic: {
    id: string;
    title: string;
    duration: number;
    audioUrl: string;
  };
  isCurrentlyPlaying: boolean;
  playbackState: PlaybackState;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}
```

### 3. InlineAudioControls Component

**Purpose:** Play/pause/stop button group with visual feedback

```typescript
interface InlineAudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  size?: 'small' | 'medium' | 'large';
}
```

### 4. InlineAudioManager Service

**Purpose:** Core audio management service for inline playback

```typescript
class InlineAudioManager {
  private audioInstance: Audio | null;
  private currentTopic: string | null;
  private progressInterval: NodeJS.Timeout | null;
  
  async playTopic(topicId: string, audioUrl: string): Promise<void>;
  pauseAudio(): void;
  stopAudio(): void;
  getCurrentProgress(): number;
  getDuration(): number;
  cleanup(): void;
}
```

## Data Models

### Enhanced Topic Model

```typescript
interface AudioTopic {
  id: string;
  title: string;
  description?: string;
  duration: number;
  audioUrl: string;
  categoryId: string;
  // Existing fields remain unchanged
}
```

### Inline Audio State Model

```typescript
interface InlineAudioState {
  currentPlayingTopic: string | null;
  playbackState: 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';
  progress: number; // Current position in seconds
  duration: number; // Total duration in seconds
  error: string | null;
}
```

### Visual State Model

```typescript
interface TopicRowVisualState {
  isActive: boolean; // Currently playing
  isPaused: boolean; // Paused state
  isLoading: boolean; // Loading audio
  hasError: boolean; // Error state
  progressPercentage: number; // 0-100 for visual progress
}
```

## Error Handling

### Error Types and Recovery

1. **Audio Loading Errors**
   - Display error icon in controls
   - Provide retry functionality
   - Show error message with fallback options

2. **Network Connectivity Issues**
   - Detect network state changes
   - Queue playback when connection restored
   - Show appropriate loading states

3. **Audio Format/Codec Issues**
   - Graceful degradation with error messaging
   - Alternative audio format suggestions
   - User-friendly error descriptions

4. **Multiple Audio Conflicts**
   - Automatic stopping of previous audio
   - Clear visual feedback on active audio
   - Prevent multiple simultaneous playback

### Error Recovery Strategies

```typescript
interface ErrorRecoveryStrategy {
  retryAttempts: number;
  retryDelay: number;
  fallbackActions: string[];
  userNotification: boolean;
}
```

## Testing Strategy

### Unit Testing

1. **InlineAudioManager Tests**
   - Audio loading and playback functionality
   - State transitions (play → pause → stop)
   - Error handling and recovery
   - Progress tracking accuracy

2. **Component Tests**
   - TopicRow rendering with different states
   - InlineAudioControls button interactions
   - Visual state changes and animations
   - Accessibility features

3. **Context Provider Tests**
   - State management across multiple components
   - Audio switching between topics
   - Memory cleanup and resource management

### Integration Testing

1. **Audio Playback Flow**
   - End-to-end audio playback from topic selection
   - Multiple topic switching scenarios
   - Background/foreground app state handling

2. **UI Interaction Testing**
   - Touch interactions on different screen sizes
   - Scrolling behavior with active audio
   - Visual feedback during state changes

3. **Performance Testing**
   - Memory usage with multiple audio files
   - Smooth scrolling with active playback
   - Audio loading and buffering performance

### Accessibility Testing

1. **Screen Reader Compatibility**
   - Proper ARIA labels for all controls
   - Audio state announcements
   - Navigation between controls

2. **Touch Accessibility**
   - Minimum touch target sizes (44x44pt)
   - Proper focus management
   - Haptic feedback integration

## Implementation Phases

### Phase 1: Core Audio Infrastructure
- Create InlineAudioManager service
- Implement InlineAudioProvider context
- Basic play/pause/stop functionality

### Phase 2: UI Components
- Develop TopicRow component
- Create InlineAudioControls component
- Implement visual state indicators

### Phase 3: Integration and Polish
- Integrate components into TopicListScreen
- Add progress tracking and visual feedback
- Implement error handling and recovery

### Phase 4: Testing and Optimization
- Comprehensive testing suite
- Performance optimization
- Accessibility enhancements

## Technical Considerations

### Audio Resource Management
- Single audio instance to prevent conflicts
- Proper cleanup on component unmount
- Memory-efficient progress tracking

### Performance Optimization
- Lazy loading of audio resources
- Efficient re-rendering strategies
- Smooth scrolling with active audio

### Platform Compatibility
- iOS and Android audio API differences
- Background audio handling
- Platform-specific UI adaptations

### State Management
- Centralized audio state through Context API
- Efficient state updates to prevent unnecessary re-renders
- Persistent state during navigation