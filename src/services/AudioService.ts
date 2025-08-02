import Sound from 'react-native-sound';
import { AudioTopic, PlaybackState } from '../types';
import ProgressService from './ProgressService';

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
  private sound: Sound | null = null;
  private currentTopic: AudioTopic | null = null;
  private isInitialized = false;
  private currentPosition = 0;
  private duration = 0;
  private volume = 1.0;
  private playbackRate = 1.0;
  private isPlaying = false;
  private positionUpdateInterval: NodeJS.Timeout | null = null;
  private progressService: ProgressService;
  private onProgressUpdate?: (position: number) => void;

  constructor() {
    this.progressService = new ProgressService();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Enable playback in silence mode (iOS)
      Sound.setCategory('Playback');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      throw new Error('Audio service initialization failed');
    }
  }

  async setupBackgroundMode(): Promise<void> {
    // react-native-sound doesn't have built-in background mode support
    // This would require additional setup with background tasks
    console.log('Background mode setup - requires additional configuration');
  }

  handleAudioInterruptions(): void {
    // react-native-sound handles basic interruptions automatically
    console.log('Audio interruption handling enabled');
  }

  async loadTrack(topic: AudioTopic): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      // Release previous sound
      if (this.sound) {
        this.sound.release();
        this.sound = null;
      }

      // Create new sound instance
      this.sound = new Sound(topic.audioUrl, '', (error) => {
        if (error) {
          console.error('Failed to load track:', error);
          reject(new Error(`Failed to load audio track: ${topic.title}`));
          return;
        }

        if (this.sound) {
          this.currentTopic = topic;
          this.duration = this.sound.getDuration();
          this.currentPosition = 0;
          
          // Start progress tracking for the new topic
          this.progressService.startProgressTracking(topic);
          
          resolve();
        } else {
          reject(new Error('Sound instance is null'));
        }
      });
    });
  }

  async play(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.sound) {
        reject(new Error('No audio track loaded'));
        return;
      }

      this.sound.play((success) => {
        if (success) {
          this.isPlaying = true;
          this.startPositionUpdates();
          resolve();
        } else {
          reject(new Error('Failed to start audio playback'));
        }
      });
    });
  }

  async pause(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve) => {
      if (!this.sound) {
        resolve();
        return;
      }

      this.sound.pause();
      this.isPlaying = false;
      this.stopPositionUpdates();
      resolve();
    });
  }

  async seekTo(position: number): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.sound) {
        reject(new Error('No audio track loaded'));
        return;
      }

      this.sound.setCurrentTime(position);
      this.currentPosition = position;
      resolve();
    });
  }

  async setVolume(volume: number): Promise<void> {
    await this.ensureInitialized();
    
    // Ensure volume is between 0 and 1
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    
    return new Promise((resolve) => {
      if (this.sound) {
        this.sound.setVolume(normalizedVolume);
      }
      this.volume = normalizedVolume;
      resolve();
    });
  }

  async getCurrentPosition(): Promise<number> {
    await this.ensureInitialized();
    
    return new Promise((resolve) => {
      if (!this.sound) {
        resolve(0);
        return;
      }

      this.sound.getCurrentTime((seconds) => {
        this.currentPosition = seconds;
        resolve(seconds);
      });
    });
  }

  async getDuration(): Promise<number> {
    await this.ensureInitialized();
    
    return Promise.resolve(this.duration);
  }

  async getPlaybackState(): Promise<PlaybackState> {
    await this.ensureInitialized();
    
    const position = await this.getCurrentPosition();

    return {
      isPlaying: this.isPlaying,
      currentTopic: this.currentTopic,
      currentPosition: position,
      duration: this.duration,
      volume: this.volume,
      playbackRate: this.playbackRate,
      isLoading: false,
      error: null,
    };
  }

  async skipToNext(): Promise<void> {
    // This would require playlist management
    console.log('Skip to next - requires playlist implementation');
  }

  async skipToPrevious(): Promise<void> {
    // This would require playlist management
    console.log('Skip to previous - requires playlist implementation');
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await this.ensureInitialized();
    
    // react-native-sound doesn't support playback rate changes
    // This would require a different audio library
    console.log('Playback rate change not supported by react-native-sound');
    this.playbackRate = rate;
  }

  async destroy(): Promise<void> {
    try {
      this.stopPositionUpdates();
      
      // Stop progress tracking
      this.progressService.stopProgressTracking();
      
      if (this.sound) {
        this.sound.release();
        this.sound = null;
      }
      
      this.currentTopic = null;
      this.isInitialized = false;
      this.isPlaying = false;
    } catch (error) {
      console.error('Failed to destroy AudioService:', error);
    }
  }

  /**
   * Set progress update callback
   */
  setProgressUpdateCallback(callback: (position: number) => void): void {
    this.onProgressUpdate = callback;
  }

  /**
   * Get progress service instance
   */
  getProgressService(): ProgressService {
    return this.progressService;
  }

  private startPositionUpdates(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }

    this.positionUpdateInterval = setInterval(async () => {
      if (this.isPlaying && this.sound) {
        const position = await this.getCurrentPosition();
        
        // Update progress service with current position
        if (this.currentTopic) {
          await this.progressService.updateProgress(position);
        }
        
        // Call external progress update callback if provided
        if (this.onProgressUpdate) {
          this.onProgressUpdate(position);
        }
        
        // Check if topic should be marked as completed
        if (this.currentTopic && position >= this.duration * 0.95) {
          await this.progressService.markCompleted(this.currentTopic.id);
        }
      }
    }, 1000);
  }

  private stopPositionUpdates(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

export default AudioService;