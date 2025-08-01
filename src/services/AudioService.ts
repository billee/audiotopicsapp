// Temporarily disabled react-native-track-player due to build issues
// import TrackPlayer, {
//   Track,
//   State,
//   Event,
//   AppKilledPlaybackBehavior,
//   Capability,
//   RepeatMode,
//   IOSCategory,
//   IOSCategoryMode,
//   AndroidAudioContentType,
//   AndroidAudioFocusMode,
//   AndroidAudioUsage,
// } from 'react-native-track-player';

// Mock TrackPlayer for development
const TrackPlayer = {
  setupPlayer: async () => Promise.resolve(),
  updateOptions: async () => Promise.resolve(),
  addEventListener: () => ({ remove: () => {} }),
  reset: async () => Promise.resolve(),
  add: async () => Promise.resolve(),
  play: async () => Promise.resolve(),
  pause: async () => Promise.resolve(),
  seekTo: async () => Promise.resolve(),
  setVolume: async () => Promise.resolve(),
  getPosition: async () => Promise.resolve(0),
  getDuration: async () => Promise.resolve(100),
  getState: async () => Promise.resolve('paused'),
  getVolume: async () => Promise.resolve(1),
  getRate: async () => Promise.resolve(1),
  skipToNext: async () => Promise.resolve(),
  skipToPrevious: async () => Promise.resolve(),
  setRate: async () => Promise.resolve(),
  stop: async () => Promise.resolve(),
};

// Mock enums
const State = { Playing: 'playing', Paused: 'paused', Buffering: 'buffering', Loading: 'loading' };
const Event = {
  RemotePlay: 'remote-play',
  RemotePause: 'remote-pause',
  RemoteStop: 'remote-stop',
  RemoteSeek: 'remote-seek',
  RemoteNext: 'remote-next',
  RemotePrevious: 'remote-previous',
  RemoteDuck: 'remote-duck',
};
const Capability = {
  Play: 'play',
  Pause: 'pause',
  SkipToNext: 'skip-to-next',
  SkipToPrevious: 'skip-to-previous',
  SeekTo: 'seek-to',
  Stop: 'stop',
};
const AppKilledPlaybackBehavior = { ContinuePlayback: 'continue' };
const IOSCategory = { Playback: 'playback' };
const IOSCategoryMode = { SpokenAudio: 'spoken-audio' };
const AndroidAudioContentType = { Speech: 'speech' };
const AndroidAudioFocusMode = { Gain: 'gain' };
const AndroidAudioUsage = { Media: 'media' };

// Mock Track interface
interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  description: string;
  duration: number;
  artwork?: string;
}

import { AudioTopic, PlaybackState } from '../types';

export interface AudioServiceInterface {
  loadTrack(topic: AudioTopic): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seekTo(position: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentPosition(): Promise<number>;
  getDuration(): Promise<number>;
  setupBackgroundMode(): Promise<void>;
  handleAudioInterruptions(): void;
  getPlaybackState(): Promise<PlaybackState>;
  skipToNext(): Promise<void>;
  skipToPrevious(): Promise<void>;
  setPlaybackRate(rate: number): Promise<void>;
  destroy(): Promise<void>;
}

class AudioService implements AudioServiceInterface {
  private isInitialized = false;
  private currentTopic: AudioTopic | null = null;
  private interruptionListeners: (() => void)[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await TrackPlayer.setupPlayer({
        // iOS Audio Session Configuration
        iosCategory: IOSCategory.Playback,
        iosCategoryMode: IOSCategoryMode.SpokenAudio,
        
        // Android Audio Configuration
        androidAudioContentType: AndroidAudioContentType.Speech,
        androidAudioFocusMode: AndroidAudioFocusMode.Gain,
        androidAudioUsage: AndroidAudioUsage.Media,
      });

      await this.setupBackgroundMode();
      this.handleAudioInterruptions();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      throw new Error('Audio service initialization failed');
    }
  }

  async setupBackgroundMode(): Promise<void> {
    await TrackPlayer.updateOptions({
      // Capabilities that will show up when the notification is posted
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],

      // Capabilities that will show up when the notification is posted but the player is stopped
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
      ],

      // Using default system icons for now
      // Custom icons can be added later

      // Whether the player should stop when the app is closed
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
    });
  }

  handleAudioInterruptions(): void {
    // Handle remote control events (lock screen, notification controls)
    const remotePlayListener = TrackPlayer.addEventListener(Event.RemotePlay, () => {
      this.play();
    });

    const remotePauseListener = TrackPlayer.addEventListener(Event.RemotePause, () => {
      this.pause();
    });

    const remoteStopListener = TrackPlayer.addEventListener(Event.RemoteStop, () => {
      this.pause();
    });

    const remoteSeekListener = TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
      this.seekTo(event.position);
    });

    const remoteNextListener = TrackPlayer.addEventListener(Event.RemoteNext, () => {
      this.skipToNext();
    });

    const remotePreviousListener = TrackPlayer.addEventListener(Event.RemotePrevious, () => {
      this.skipToPrevious();
    });

    // Handle audio focus changes (phone calls, other apps)
    const audioFocusListener = TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
      if (event.paused) {
        // Audio focus lost, pause playback
        this.pause();
      } else {
        // Audio focus regained, can resume if user wants
        // Note: We don't auto-resume to give user control
      }
    });

    // Store listeners for cleanup
    this.interruptionListeners = [
      remotePlayListener,
      remotePauseListener,
      remoteStopListener,
      remoteSeekListener,
      remoteNextListener,
      remotePreviousListener,
      audioFocusListener,
    ];
  }

  async loadTrack(topic: AudioTopic): Promise<void> {
    await this.ensureInitialized();

    const track: Track = {
      id: topic.id,
      url: topic.audioUrl,
      title: topic.title,
      artist: topic.author || 'Unknown Artist',
      description: topic.description,
      duration: topic.duration,
      artwork: topic.thumbnailUrl,
    };

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      this.currentTopic = topic;
    } catch (error) {
      console.error('Failed to load track:', error);
      throw new Error(`Failed to load audio track: ${topic.title}`);
    }
  }

  async play(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw new Error('Failed to start audio playback');
    }
  }

  async pause(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Failed to pause audio:', error);
      throw new Error('Failed to pause audio playback');
    }
  }

  async seekTo(position: number): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Failed to seek audio:', error);
      throw new Error('Failed to seek to position');
    }
  }

  async setVolume(volume: number): Promise<void> {
    await this.ensureInitialized();
    
    // Ensure volume is between 0 and 1
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    
    try {
      await TrackPlayer.setVolume(normalizedVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw new Error('Failed to set audio volume');
    }
  }

  async getCurrentPosition(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      return await TrackPlayer.getPosition();
    } catch (error) {
      console.error('Failed to get current position:', error);
      return 0;
    }
  }

  async getDuration(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      return await TrackPlayer.getDuration();
    } catch (error) {
      console.error('Failed to get duration:', error);
      return 0;
    }
  }

  async getPlaybackState(): Promise<PlaybackState> {
    await this.ensureInitialized();
    
    try {
      const state = await TrackPlayer.getState();
      const position = await this.getCurrentPosition();
      const duration = await this.getDuration();
      const volume = await TrackPlayer.getVolume();
      const rate = await TrackPlayer.getRate();

      return {
        isPlaying: state === State.Playing,
        currentTopic: this.currentTopic,
        currentPosition: position,
        duration: duration,
        volume: volume,
        playbackRate: rate,
        isLoading: state === State.Buffering || state === State.Loading,
        error: null,
      };
    } catch (error) {
      console.error('Failed to get playback state:', error);
      return {
        isPlaying: false,
        currentTopic: this.currentTopic,
        currentPosition: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async skipToNext(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Failed to skip to next:', error);
      throw new Error('Failed to skip to next track');
    }
  }

  async skipToPrevious(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Failed to skip to previous:', error);
      throw new Error('Failed to skip to previous track');
    }
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await this.ensureInitialized();
    
    // Ensure rate is within reasonable bounds
    const normalizedRate = Math.max(0.25, Math.min(3.0, rate));
    
    try {
      await TrackPlayer.setRate(normalizedRate);
    } catch (error) {
      console.error('Failed to set playback rate:', error);
      throw new Error('Failed to set playback rate');
    }
  }

  async destroy(): Promise<void> {
    try {
      // Remove all event listeners
      this.interruptionListeners.forEach(listener => listener.remove());
      this.interruptionListeners = [];

      // Stop and reset the player
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      
      this.currentTopic = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to destroy AudioService:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

export default AudioService;