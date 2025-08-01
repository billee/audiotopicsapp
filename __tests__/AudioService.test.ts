import AudioService from '../src/services/AudioService';
import TrackPlayer, { State } from 'react-native-track-player';
import { AudioTopic } from '../src/types';

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  reset: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  seekTo: jest.fn(),
  setVolume: jest.fn(),
  getPosition: jest.fn(),
  getDuration: jest.fn(),
  getState: jest.fn(),
  getVolume: jest.fn(),
  getRate: jest.fn(),
  setRate: jest.fn(),
  skipToNext: jest.fn(),
  skipToPrevious: jest.fn(),
  registerPlaybackService: jest.fn(),
  State: {
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteStop: 'remote-stop',
    RemoteSeek: 'remote-seek',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteDuck: 'remote-duck',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    SkipToNext: 'next',
    SkipToPrevious: 'previous',
    SeekTo: 'seek',
    Stop: 'stop',
  },
  AppKilledPlaybackBehavior: {
    ContinuePlayback: 'continue',
  },
  IOSCategory: {
    Playback: 'playback',
  },
  IOSCategoryMode: {
    SpokenAudio: 'spokenAudio',
  },
  AndroidAudioContentType: {
    Speech: 'speech',
  },
  AndroidAudioFocusMode: {
    Gain: 'gain',
  },
  AndroidAudioUsage: {
    Media: 'media',
  },
}));

const mockTrackPlayer = TrackPlayer as jest.Mocked<typeof TrackPlayer>;

describe('AudioService', () => {
  let audioService: AudioService;
  let mockAudioTopic: AudioTopic;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset TrackPlayer mocks
    mockTrackPlayer.setupPlayer.mockResolvedValue(undefined);
    mockTrackPlayer.updateOptions.mockResolvedValue(undefined);
    mockTrackPlayer.reset.mockResolvedValue(undefined);
    mockTrackPlayer.add.mockResolvedValue(undefined);
    mockTrackPlayer.play.mockResolvedValue(undefined);
    mockTrackPlayer.pause.mockResolvedValue(undefined);
    mockTrackPlayer.stop.mockResolvedValue(undefined);
    mockTrackPlayer.seekTo.mockResolvedValue(undefined);
    mockTrackPlayer.setVolume.mockResolvedValue(undefined);
    mockTrackPlayer.getPosition.mockResolvedValue(0);
    mockTrackPlayer.getDuration.mockResolvedValue(100);
    mockTrackPlayer.getState.mockResolvedValue(State.Paused);
    mockTrackPlayer.getVolume.mockResolvedValue(1);
    mockTrackPlayer.getRate.mockResolvedValue(1);
    mockTrackPlayer.setRate.mockResolvedValue(undefined);
    mockTrackPlayer.skipToNext.mockResolvedValue(undefined);
    mockTrackPlayer.skipToPrevious.mockResolvedValue(undefined);

    mockAudioTopic = {
      id: 'test-topic-1',
      title: 'Test Audio Topic',
      description: 'A test audio topic for unit testing',
      categoryId: 'test-category',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 300,
      author: 'Test Author',
      publishDate: new Date('2023-01-01'),
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 5000000,
      },
    };

    audioService = new AudioService();
  });

  afterEach(async () => {
    await audioService.destroy();
  });

  describe('Initialization', () => {
    it('should initialize TrackPlayer with correct configuration', async () => {
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockTrackPlayer.setupPlayer).toHaveBeenCalledWith({
        iosCategory: 'playback',
        iosCategoryMode: 'spokenAudio',
        androidAudioContentType: 'speech',
        androidAudioFocusMode: 'gain',
        androidAudioUsage: 'media',
      });
    });

    it('should set up background mode capabilities', async () => {
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockTrackPlayer.updateOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          capabilities: expect.arrayContaining([
            'play', 'pause', 'next', 'previous', 'seek', 'stop'
          ]),
          notificationCapabilities: ['play', 'pause'],
          android: {
            appKilledPlaybackBehavior: 'continue',
          },
        })
      );
    });

    it('should set up audio interruption listeners', async () => {
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockTrackPlayer.addEventListener).toHaveBeenCalledTimes(7);
    });
  });

  describe('Track Loading', () => {
    it('should load an audio track successfully', async () => {
      await audioService.loadTrack(mockAudioTopic);

      expect(mockTrackPlayer.reset).toHaveBeenCalled();
      expect(mockTrackPlayer.add).toHaveBeenCalledWith({
        id: mockAudioTopic.id,
        url: mockAudioTopic.audioUrl,
        title: mockAudioTopic.title,
        artist: mockAudioTopic.author,
        description: mockAudioTopic.description,
        duration: mockAudioTopic.duration,
        artwork: mockAudioTopic.thumbnailUrl,
      });
    });

    it('should handle missing author gracefully', async () => {
      const topicWithoutAuthor = { ...mockAudioTopic, author: undefined };
      await audioService.loadTrack(topicWithoutAuthor);

      expect(mockTrackPlayer.add).toHaveBeenCalledWith(
        expect.objectContaining({
          artist: 'Unknown Artist',
        })
      );
    });

    it('should throw error when track loading fails', async () => {
      mockTrackPlayer.add.mockRejectedValue(new Error('Failed to add track'));

      await expect(audioService.loadTrack(mockAudioTopic)).rejects.toThrow(
        'Failed to load audio track: Test Audio Topic'
      );
    });
  });

  describe('Playback Controls', () => {
    beforeEach(async () => {
      await audioService.loadTrack(mockAudioTopic);
    });

    it('should play audio successfully', async () => {
      await audioService.play();
      expect(mockTrackPlayer.play).toHaveBeenCalled();
    });

    it('should pause audio successfully', async () => {
      await audioService.pause();
      expect(mockTrackPlayer.pause).toHaveBeenCalled();
    });

    it('should seek to specific position', async () => {
      const position = 150;
      await audioService.seekTo(position);
      expect(mockTrackPlayer.seekTo).toHaveBeenCalledWith(position);
    });

    it('should set volume within valid range', async () => {
      await audioService.setVolume(0.5);
      expect(mockTrackPlayer.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('should normalize volume to valid range', async () => {
      await audioService.setVolume(1.5); // Above max
      expect(mockTrackPlayer.setVolume).toHaveBeenCalledWith(1);

      await audioService.setVolume(-0.5); // Below min
      expect(mockTrackPlayer.setVolume).toHaveBeenCalledWith(0);
    });

    it('should skip to next track', async () => {
      await audioService.skipToNext();
      expect(mockTrackPlayer.skipToNext).toHaveBeenCalled();
    });

    it('should skip to previous track', async () => {
      await audioService.skipToPrevious();
      expect(mockTrackPlayer.skipToPrevious).toHaveBeenCalled();
    });

    it('should set playback rate within valid range', async () => {
      await audioService.setPlaybackRate(1.5);
      expect(mockTrackPlayer.setRate).toHaveBeenCalledWith(1.5);
    });

    it('should normalize playback rate to valid range', async () => {
      await audioService.setPlaybackRate(5.0); // Above max
      expect(mockTrackPlayer.setRate).toHaveBeenCalledWith(3.0);

      await audioService.setPlaybackRate(0.1); // Below min
      expect(mockTrackPlayer.setRate).toHaveBeenCalledWith(0.25);
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await audioService.loadTrack(mockAudioTopic);
    });

    it('should get current position', async () => {
      mockTrackPlayer.getPosition.mockResolvedValue(75);
      const position = await audioService.getCurrentPosition();
      expect(position).toBe(75);
    });

    it('should get duration', async () => {
      mockTrackPlayer.getDuration.mockResolvedValue(300);
      const duration = await audioService.getDuration();
      expect(duration).toBe(300);
    });

    it('should return complete playback state', async () => {
      mockTrackPlayer.getState.mockResolvedValue(State.Playing);
      mockTrackPlayer.getPosition.mockResolvedValue(50);
      mockTrackPlayer.getDuration.mockResolvedValue(200);
      mockTrackPlayer.getVolume.mockResolvedValue(0.8);
      mockTrackPlayer.getRate.mockResolvedValue(1.2);

      const state = await audioService.getPlaybackState();

      expect(state).toEqual({
        isPlaying: true,
        currentTopic: mockAudioTopic,
        currentPosition: 50,
        duration: 200,
        volume: 0.8,
        playbackRate: 1.2,
        isLoading: false,
        error: null,
      });
    });

    it('should handle loading state correctly', async () => {
      mockTrackPlayer.getState.mockResolvedValue(State.Buffering);
      const state = await audioService.getPlaybackState();
      expect(state.isLoading).toBe(true);
    });

    it('should handle errors in state retrieval', async () => {
      mockTrackPlayer.getState.mockRejectedValue(new Error('State error'));
      const state = await audioService.getPlaybackState();
      
      expect(state.error).toBe('State error');
      expect(state.isPlaying).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle play errors gracefully', async () => {
      mockTrackPlayer.play.mockRejectedValue(new Error('Play failed'));
      
      await expect(audioService.play()).rejects.toThrow('Failed to start audio playback');
    });

    it('should handle pause errors gracefully', async () => {
      mockTrackPlayer.pause.mockRejectedValue(new Error('Pause failed'));
      
      await expect(audioService.pause()).rejects.toThrow('Failed to pause audio playback');
    });

    it('should handle seek errors gracefully', async () => {
      mockTrackPlayer.seekTo.mockRejectedValue(new Error('Seek failed'));
      
      await expect(audioService.seekTo(100)).rejects.toThrow('Failed to seek to position');
    });

    it('should return 0 for position when error occurs', async () => {
      mockTrackPlayer.getPosition.mockRejectedValue(new Error('Position error'));
      
      const position = await audioService.getCurrentPosition();
      expect(position).toBe(0);
    });

    it('should return 0 for duration when error occurs', async () => {
      mockTrackPlayer.getDuration.mockRejectedValue(new Error('Duration error'));
      
      const duration = await audioService.getDuration();
      expect(duration).toBe(0);
    });
  });

  describe('Cleanup', () => {
    it('should destroy service and clean up resources', async () => {
      await audioService.destroy();

      expect(mockTrackPlayer.stop).toHaveBeenCalled();
      expect(mockTrackPlayer.reset).toHaveBeenCalled();
    });

    it('should handle destroy errors gracefully', async () => {
      mockTrackPlayer.stop.mockRejectedValue(new Error('Stop failed'));
      
      // Should not throw
      await expect(audioService.destroy()).resolves.toBeUndefined();
    });
  });

  describe('Initialization Errors', () => {
    it('should handle initialization failure gracefully', async () => {
      mockTrackPlayer.setupPlayer.mockRejectedValue(new Error('Setup failed'));
      
      // Create service that will fail to initialize
      const failingService = new AudioService();
      
      // Wait for initialization attempt to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // The service should still be created but methods should fail gracefully
      // Since initialization failed, any method call should result in re-initialization attempt
      // which will also fail and throw the initialization error
      await expect(failingService.play()).rejects.toThrow();
    });
  });
});