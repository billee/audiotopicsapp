import Sound from 'react-native-sound';
import { AudioTopic } from '../types';

export type InlineAudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

export interface InlineAudioProgress {
    currentPosition: number;
    duration: number;
    percentage: number;
}

export interface InlineAudioError {
    code: string;
    message: string;
    retryable: boolean;
}

export interface InlineAudioManagerEvents {
    onStateChange: (state: InlineAudioState) => void;
    onProgressUpdate: (progress: InlineAudioProgress) => void;
    onError: (error: InlineAudioError) => void;
    onPlaybackComplete: () => void;
}

/**
 * InlineAudioManager - Core service for managing inline audio playback
 * Ensures only one audio instance plays at a time with proper resource management
 */
class InlineAudioManager {
    private audioInstance: Sound | null = null;
    private currentTopic: AudioTopic | null = null;
    private currentState: InlineAudioState = 'idle';
    private progressInterval: NodeJS.Timeout | null = null;
    private isInitialized = false;
    private eventHandlers: Partial<InlineAudioManagerEvents> = {};
    private retryCount = 0;
    private readonly maxRetries = 3;

    constructor() {
        this.initialize();
    }

    /**
     * Initialize the audio manager
     */
    private async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Enable playback in silence mode (iOS)
            Sound.setCategory('Playback');
            this.isInitialized = true;
        } catch (error) {
            console.error('InlineAudioManager: Failed to initialize:', error);
            this.handleError('INIT_ERROR', 'Failed to initialize audio system', false);
        }
    }

    /**
     * Set event handlers for audio state changes
     */
    setEventHandlers(handlers: Partial<InlineAudioManagerEvents>): void {
        this.eventHandlers = { ...this.eventHandlers, ...handlers };
    }

    /**
     * Play audio for a specific topic
     */
    async playTopic(topic: AudioTopic): Promise<void> {
        await this.ensureInitialized();

        try {
            // Stop current audio if playing different topic
            if (this.currentTopic && this.currentTopic.id !== topic.id) {
                await this.stopAudio();
            }

            // If same topic is paused, resume it
            if (this.currentTopic?.id === topic.id && this.currentState === 'paused') {
                await this.resumeAudio();
                return;
            }

            // Load and play new topic
            if (!this.currentTopic || this.currentTopic.id !== topic.id || this.currentState === 'stopped') {
                await this.loadTopic(topic);
            }

            await this.startPlayback();
        } catch (error) {
            console.error('InlineAudioManager: Failed to play topic:', error);
            this.handleError('PLAYBACK_ERROR', `Failed to play ${topic.title}`, true);
        }
    }

    /**
     * Pause current audio playback
     */
    async pauseAudio(): Promise<void> {
        if (!this.audioInstance || this.currentState !== 'playing') {
            return;
        }

        try {
            this.audioInstance.pause();
            this.setState('paused');
            this.stopProgressTracking();
        } catch (error) {
            console.error('InlineAudioManager: Failed to pause audio:', error);
            this.handleError('PAUSE_ERROR', 'Failed to pause audio', true);
        }
    }

    /**
     * Stop current audio playback and reset position
     */
    async stopAudio(): Promise<void> {
        try {
            this.stopProgressTracking();

            if (this.audioInstance) {
                this.audioInstance.stop();
                this.audioInstance.setCurrentTime(0);
            }

            this.setState('stopped');
            this.retryCount = 0;
        } catch (error) {
            console.error('InlineAudioManager: Failed to stop audio:', error);
            this.handleError('STOP_ERROR', 'Failed to stop audio', false);
        }
    }

    /**
     * Resume paused audio playback
     */
    private async resumeAudio(): Promise<void> {
        if (!this.audioInstance || this.currentState !== 'paused') {
            return;
        }

        try {
            await this.startPlayback();
        } catch (error) {
            console.error('InlineAudioManager: Failed to resume audio:', error);
            this.handleError('RESUME_ERROR', 'Failed to resume audio', true);
        }
    }

    /**
     * Get current playback progress
     */
    getCurrentProgress(): InlineAudioProgress {
        if (!this.audioInstance) {
            return { currentPosition: 0, duration: 0, percentage: 0 };
        }

        return new Promise((resolve) => {
            this.audioInstance!.getCurrentTime((position) => {
                const duration = this.audioInstance!.getDuration();
                const percentage = duration > 0 ? (position / duration) * 100 : 0;

                resolve({
                    currentPosition: position,
                    duration,
                    percentage: Math.min(100, Math.max(0, percentage))
                });
            });
        }) as any; // Type assertion for synchronous usage in some contexts
    }

    /**
     * Get current audio state
     */
    getCurrentState(): InlineAudioState {
        return this.currentState;
    }

    /**
     * Get currently playing topic
     */
    getCurrentTopic(): AudioTopic | null {
        return this.currentTopic;
    }

    /**
     * Check if a specific topic is currently playing
     */
    isTopicPlaying(topicId: string): boolean {
        return this.currentTopic?.id === topicId && this.currentState === 'playing';
    }

    /**
     * Check if a specific topic is currently paused
     */
    isTopicPaused(topicId: string): boolean {
        return this.currentTopic?.id === topicId && this.currentState === 'paused';
    }

    /**
     * Cleanup resources and stop all audio
     */
    async cleanup(): Promise<void> {
        try {
            this.stopProgressTracking();

            if (this.audioInstance) {
                this.audioInstance.release();
                this.audioInstance = null;
            }

            this.currentTopic = null;
            this.setState('idle');
            this.retryCount = 0;
        } catch (error) {
            console.error('InlineAudioManager: Failed to cleanup:', error);
        }
    }

    /**
     * Load audio topic
     */
    private async loadTopic(topic: AudioTopic): Promise<void> {
        this.setState('loading');

        return new Promise((resolve, reject) => {
            // Release previous audio instance
            if (this.audioInstance) {
                this.audioInstance.release();
                this.audioInstance = null;
            }

            // Create new audio instance
            this.audioInstance = new Sound(topic.audioUrl, '', (error) => {
                if (error) {
                    console.error('InlineAudioManager: Failed to load audio:', error);
                    reject(new Error(`Failed to load audio: ${topic.title}`));
                    return;
                }

                this.currentTopic = topic;
                this.retryCount = 0;
                resolve();
            });
        });
    }

    /**
     * Start audio playback
     */
    private async startPlayback(): Promise<void> {
        if (!this.audioInstance) {
            throw new Error('No audio instance available');
        }

        return new Promise((resolve, reject) => {
            this.audioInstance!.play((success) => {
                if (success) {
                    this.setState('playing');
                    this.startProgressTracking();
                    resolve();
                } else {
                    reject(new Error('Failed to start playback'));
                }
            });
        });
    }

    /**
     * Start progress tracking
     */
    private startProgressTracking(): void {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            if (this.audioInstance && this.currentState === 'playing') {
                this.audioInstance.getCurrentTime((position) => {
                    const duration = this.audioInstance!.getDuration();
                    const percentage = duration > 0 ? (position / duration) * 100 : 0;

                    const progress: InlineAudioProgress = {
                        currentPosition: position,
                        duration,
                        percentage: Math.min(100, Math.max(0, percentage))
                    };

                    // Emit progress update
                    if (this.eventHandlers.onProgressUpdate) {
                        this.eventHandlers.onProgressUpdate(progress);
                    }

                    // Check if playback completed
                    if (position >= duration && duration > 0) {
                        this.handlePlaybackComplete();
                    }
                });
            }
        }, 1000);
    }

    /**
     * Stop progress tracking
     */
    private stopProgressTracking(): void {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    /**
     * Handle playback completion
     */
    private handlePlaybackComplete(): void {
        this.stopProgressTracking();
        this.setState('stopped');

        if (this.eventHandlers.onPlaybackComplete) {
            this.eventHandlers.onPlaybackComplete();
        }
    }

    /**
     * Set current state and emit change event
     */
    private setState(newState: InlineAudioState): void {
        if (this.currentState !== newState) {
            this.currentState = newState;

            if (this.eventHandlers.onStateChange) {
                this.eventHandlers.onStateChange(newState);
            }
        }
    }

    /**
     * Handle errors with retry logic
     */
    private handleError(code: string, message: string, retryable: boolean): void {
        const error: InlineAudioError = {
            code,
            message,
            retryable: retryable && this.retryCount < this.maxRetries
        };

        this.setState('error');

        if (this.eventHandlers.onError) {
            this.eventHandlers.onError(error);
        }

        // Auto-retry for retryable errors
        if (error.retryable && this.currentTopic) {
            this.retryCount++;
            setTimeout(() => {
                this.playTopic(this.currentTopic!);
            }, 1000 * this.retryCount); // Exponential backoff
        }
    }

    /**
     * Ensure audio manager is initialized
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
}

export default InlineAudioManager;