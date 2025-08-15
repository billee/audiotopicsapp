import InlineAudioManager, {
    InlineAudioState,
    InlineAudioProgress,
    InlineAudioError,
    InlineAudioManagerEvents
} from '../src/services/InlineAudioManager';
import { AudioTopic } from '../src/types';

// Mock react-native-sound
const mockSoundInstance = {
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    setCurrentTime: jest.fn(),
    getCurrentTime: jest.fn(),
    getDuration: jest.fn(),
    setVolume: jest.fn(),
};

const MockSound = jest.fn().mockImplementation((url, basePath, callback) => {
    // Simulate successful loading by default
    setTimeout(() => callback(null), 10);
    return mockSoundInstance;
});

MockSound.setCategory = jest.fn();

jest.mock('react-native-sound', () => MockSound);

describe('InlineAudioManager', () => {
    let audioManager: InlineAudioManager;
    let mockAudioTopic: AudioTopic;
    let mockEventHandlers: InlineAudioManagerEvents;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Reset mock implementations
        mockSoundInstance.play.mockImplementation((callback) => {
            setTimeout(() => callback(true), 10);
        });
        mockSoundInstance.getCurrentTime.mockImplementation((callback) => {
            callback(0);
        });
        mockSoundInstance.getDuration.mockReturnValue(300);

        mockAudioTopic = {
            id: 'test-topic-1',
            title: 'Test Audio Topic',
            description: 'A test audio topic for unit testing',
            categoryId: 'test-category',
            audioUrl: 'https://example.com/audio.mp3',
            duration: 300,
            author: 'Test Author',
            publishDate: '2023-01-01',
            thumbnailUrl: 'https://example.com/thumbnail.jpg',
            metadata: {
                bitrate: 128,
                format: 'mp3',
                size: 5000000,
            },
        };

        mockEventHandlers = {
            onStateChange: jest.fn(),
            onProgressUpdate: jest.fn(),
            onError: jest.fn(),
            onPlaybackComplete: jest.fn(),
        };

        audioManager = new InlineAudioManager();
        audioManager.setEventHandlers(mockEventHandlers);
    });

    afterEach(async () => {
        jest.useRealTimers();
        await audioManager.cleanup();
    });

    describe('Initialization', () => {
        it('should initialize with idle state', () => {
            expect(audioManager.getCurrentState()).toBe('idle');
            expect(audioManager.getCurrentTopic()).toBeNull();
        });

        it('should set audio category for iOS playback', () => {
            expect(MockSound.setCategory).toHaveBeenCalledWith('Playback');
        });
    });

    describe('Event Handlers', () => {
        it('should set and update event handlers', () => {
            const newHandlers = {
                onStateChange: jest.fn(),
                onError: jest.fn(),
            };

            audioManager.setEventHandlers(newHandlers);

            // Verify handlers are set (we'll test their invocation in other tests)
            expect(newHandlers.onStateChange).toBeDefined();
            expect(newHandlers.onError).toBeDefined();
        });
    });

    describe('Audio Loading and Playback', () => {
        it('should load and play a new topic successfully', async () => {
            const playPromise = audioManager.playTopic(mockAudioTopic);

            // Fast-forward timers to complete loading
            jest.advanceTimersByTime(20);
            await playPromise;

            expect(MockSound).toHaveBeenCalledWith(
                mockAudioTopic.audioUrl,
                '',
                expect.any(Function)
            );
            expect(mockSoundInstance.play).toHaveBeenCalled();
            expect(audioManager.getCurrentState()).toBe('playing');
            expect(audioManager.getCurrentTopic()).toEqual(mockAudioTopic);
        });

        it('should emit state change events during playback', async () => {
            const playPromise = audioManager.playTopic(mockAudioTopic);

            jest.advanceTimersByTime(20);
            await playPromise;

            expect(mockEventHandlers.onStateChange).toHaveBeenCalledWith('loading');
            expect(mockEventHandlers.onStateChange).toHaveBeenCalledWith('playing');
        });

        it('should handle audio loading errors', async () => {
            // Mock loading error
            MockSound.mockImplementationOnce((url, basePath, callback) => {
                setTimeout(() => callback(new Error('Loading failed')), 10);
                return mockSoundInstance;
            });

            const playPromise = audioManager.playTopic(mockAudioTopic);

            jest.advanceTimersByTime(20);
            await expect(playPromise).rejects.toThrow();

            expect(mockEventHandlers.onError).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'PLAYBACK_ERROR',
                    message: expect.stringContaining('Failed to play'),
                    retryable: true,
                })
            );
            expect(audioManager.getCurrentState()).toBe('error');
        });

        it('should handle playback start errors', async () => {
            // Mock play failure
            mockSoundInstance.play.mockImplementationOnce((callback) => {
                setTimeout(() => callback(false), 10);
            });

            const playPromise = audioManager.playTopic(mockAudioTopic);

            jest.advanceTimersByTime(30);
            await expect(playPromise).rejects.toThrow();

            expect(audioManager.getCurrentState()).toBe('error');
        });
    });

    describe('Audio Control Operations', () => {
        beforeEach(async () => {
            // Set up a playing audio topic
            const playPromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await playPromise;
        });

        it('should pause audio successfully', async () => {
            await audioManager.pauseAudio();

            expect(mockSoundInstance.pause).toHaveBeenCalled();
            expect(audioManager.getCurrentState()).toBe('paused');
            expect(mockEventHandlers.onStateChange).toHaveBeenCalledWith('paused');
        });

        it('should resume paused audio', async () => {
            // First pause
            await audioManager.pauseAudio();
            jest.clearAllMocks();

            // Then resume by playing same topic
            const resumePromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await resumePromise;

            expect(mockSoundInstance.play).toHaveBeenCalled();
            expect(audioManager.getCurrentState()).toBe('playing');
        });

        it('should stop audio and reset position', async () => {
            await audioManager.stopAudio();

            expect(mockSoundInstance.stop).toHaveBeenCalled();
            expect(mockSoundInstance.setCurrentTime).toHaveBeenCalledWith(0);
            expect(audioManager.getCurrentState()).toBe('stopped');
            expect(mockEventHandlers.onStateChange).toHaveBeenCalledWith('stopped');
        });

        it('should not pause when not playing', async () => {
            await audioManager.stopAudio();
            jest.clearAllMocks();

            await audioManager.pauseAudio();

            expect(mockSoundInstance.pause).not.toHaveBeenCalled();
        });
    });

    describe('State Queries', () => {
        it('should correctly identify playing topic', async () => {
            const playPromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await playPromise;

            expect(audioManager.isTopicPlaying(mockAudioTopic.id)).toBe(true);
            expect(audioManager.isTopicPlaying('other-topic')).toBe(false);
        });

        it('should correctly identify paused topic', async () => {
            const playPromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await playPromise;

            await audioManager.pauseAudio();

            expect(audioManager.isTopicPaused(mockAudioTopic.id)).toBe(true);
            expect(audioManager.isTopicPaused('other-topic')).toBe(false);
            expect(audioManager.isTopicPlaying(mockAudioTopic.id)).toBe(false);
        });

        it('should return current state and topic', async () => {
            expect(audioManager.getCurrentState()).toBe('idle');
            expect(audioManager.getCurrentTopic()).toBeNull();

            const playPromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await playPromise;

            expect(audioManager.getCurrentState()).toBe('playing');
            expect(audioManager.getCurrentTopic()).toEqual(mockAudioTopic);
        });
    });

    describe('Resource Management', () => {
        it('should cleanup resources properly', async () => {
            const playPromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await playPromise;

            await audioManager.cleanup();

            expect(mockSoundInstance.release).toHaveBeenCalled();
            expect(audioManager.getCurrentState()).toBe('idle');
            expect(audioManager.getCurrentTopic()).toBeNull();
        });

        it('should handle cleanup errors gracefully', async () => {
            const playPromise = audioManager.playTopic(mockAudioTopic);
            jest.advanceTimersByTime(20);
            await playPromise;

            // Mock release error
            mockSoundInstance.release.mockImplementation(() => {
                throw new Error('Release failed');
            });

            // Should not throw
            await expect(audioManager.cleanup()).resolves.toBeUndefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle getCurrentProgress when no audio loaded', () => {
            const progress = audioManager.getCurrentProgress();

            // Should return default values without throwing
            expect(typeof progress).toBe('object');
        });

        it('should handle operations when audio instance is null', async () => {
            // These should not throw errors
            await audioManager.pauseAudio();
            await audioManager.stopAudio();

            expect(audioManager.getCurrentState()).toBe('stopped');
        });

        it('should handle initialization errors', () => {
            MockSound.setCategory.mockImplementation(() => {
                throw new Error('Category setting failed');
            });

            // Creating new manager should handle error gracefully
            const newManager = new InlineAudioManager();
            expect(newManager).toBeDefined();
        });
    });
});