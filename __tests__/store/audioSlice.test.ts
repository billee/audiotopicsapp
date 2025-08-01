/**
 * Tests for audio slice
 */

import audioReducer, {
  setCurrentTopic,
  setPlaybackState,
  setCurrentPosition,
  setDuration,
  setVolume,
  setPlaybackRate,
  setLoading,
  setError,
  setPlaylist,
  setCurrentIndex,
  nextTrack,
  previousTrack,
  setRepeatMode,
  setShuffleMode,
  resetPlayback,
} from '../../src/store/slices/audioSlice';
import { AudioTopic } from '../../src/types';

const mockAudioTopic: AudioTopic = {
  id: '1',
  title: 'Test Topic',
  description: 'Test Description',
  categoryId: 'cat1',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 300,
  author: 'Test Author',
  publishDate: new Date('2023-01-01'),
  thumbnailUrl: 'https://example.com/thumb.jpg',
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 5000000,
  },
};

const mockPlaylist: AudioTopic[] = [
  mockAudioTopic,
  {
    ...mockAudioTopic,
    id: '2',
    title: 'Test Topic 2',
  },
  {
    ...mockAudioTopic,
    id: '3',
    title: 'Test Topic 3',
  },
];

describe('audioSlice', () => {
  const initialState = {
    isPlaying: false,
    currentTopic: null,
    currentPosition: 0,
    duration: 0,
    volume: 1.0,
    playbackRate: 1.0,
    isLoading: false,
    error: null,
    playlist: [],
    currentIndex: -1,
    repeatMode: 'none' as const,
    shuffleMode: false,
  };

  it('should return the initial state', () => {
    expect(audioReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCurrentTopic', () => {
    it('should set the current topic', () => {
      const actual = audioReducer(initialState, setCurrentTopic(mockAudioTopic));
      expect(actual.currentTopic).toEqual(mockAudioTopic);
      expect(actual.error).toBeNull();
    });

    it('should clear error when setting topic', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const actual = audioReducer(stateWithError, setCurrentTopic(mockAudioTopic));
      expect(actual.error).toBeNull();
    });
  });

  describe('setPlaybackState', () => {
    it('should set playing state to true', () => {
      const actual = audioReducer(initialState, setPlaybackState(true));
      expect(actual.isPlaying).toBe(true);
    });

    it('should set playing state to false', () => {
      const playingState = { ...initialState, isPlaying: true };
      const actual = audioReducer(playingState, setPlaybackState(false));
      expect(actual.isPlaying).toBe(false);
    });
  });

  describe('setCurrentPosition', () => {
    it('should set the current position', () => {
      const actual = audioReducer(initialState, setCurrentPosition(150));
      expect(actual.currentPosition).toBe(150);
    });
  });

  describe('setDuration', () => {
    it('should set the duration', () => {
      const actual = audioReducer(initialState, setDuration(300));
      expect(actual.duration).toBe(300);
    });
  });

  describe('setVolume', () => {
    it('should set volume within valid range', () => {
      const actual = audioReducer(initialState, setVolume(0.5));
      expect(actual.volume).toBe(0.5);
    });

    it('should clamp volume to minimum 0', () => {
      const actual = audioReducer(initialState, setVolume(-0.5));
      expect(actual.volume).toBe(0);
    });

    it('should clamp volume to maximum 1', () => {
      const actual = audioReducer(initialState, setVolume(1.5));
      expect(actual.volume).toBe(1);
    });
  });

  describe('setPlaybackRate', () => {
    it('should set the playback rate', () => {
      const actual = audioReducer(initialState, setPlaybackRate(1.5));
      expect(actual.playbackRate).toBe(1.5);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const actual = audioReducer(initialState, setLoading(true));
      expect(actual.isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error and stop loading', () => {
      const loadingState = { ...initialState, isLoading: true };
      const actual = audioReducer(loadingState, setError('Test error'));
      expect(actual.error).toBe('Test error');
      expect(actual.isLoading).toBe(false);
    });

    it('should clear error', () => {
      const errorState = { ...initialState, error: 'Test error' };
      const actual = audioReducer(errorState, setError(null));
      expect(actual.error).toBeNull();
    });
  });

  describe('playlist management', () => {
    it('should set playlist and current index', () => {
      const actual = audioReducer(initialState, setPlaylist(mockPlaylist));
      expect(actual.playlist).toEqual(mockPlaylist);
      expect(actual.currentIndex).toBe(0);
    });

    it('should set empty playlist', () => {
      const actual = audioReducer(initialState, setPlaylist([]));
      expect(actual.playlist).toEqual([]);
      expect(actual.currentIndex).toBe(-1);
    });

    it('should set current index and topic', () => {
      const stateWithPlaylist = { ...initialState, playlist: mockPlaylist };
      const actual = audioReducer(stateWithPlaylist, setCurrentIndex(1));
      expect(actual.currentIndex).toBe(1);
      expect(actual.currentTopic).toEqual(mockPlaylist[1]);
    });

    it('should not set invalid index', () => {
      const stateWithPlaylist = { ...initialState, playlist: mockPlaylist };
      const actual = audioReducer(stateWithPlaylist, setCurrentIndex(10));
      expect(actual.currentIndex).toBe(-1);
      expect(actual.currentTopic).toBeNull();
    });
  });

  describe('track navigation', () => {
    const stateWithPlaylist = {
      ...initialState,
      playlist: mockPlaylist,
      currentIndex: 1,
      currentTopic: mockPlaylist[1],
    };

    describe('nextTrack', () => {
      it('should go to next track', () => {
        const actual = audioReducer(stateWithPlaylist, nextTrack());
        expect(actual.currentIndex).toBe(2);
        expect(actual.currentTopic).toEqual(mockPlaylist[2]);
        expect(actual.currentPosition).toBe(0);
      });

      it('should stay at current track when repeat mode is one', () => {
        const repeatOneState = { ...stateWithPlaylist, repeatMode: 'one' as const };
        const actual = audioReducer(repeatOneState, nextTrack());
        expect(actual.currentIndex).toBe(1);
        expect(actual.currentTopic).toEqual(mockPlaylist[1]);
      });

      it('should loop to first track when repeat mode is all', () => {
        const lastTrackState = { ...stateWithPlaylist, currentIndex: 2, repeatMode: 'all' as const };
        const actual = audioReducer(lastTrackState, nextTrack());
        expect(actual.currentIndex).toBe(0);
        expect(actual.currentTopic).toEqual(mockPlaylist[0]);
      });

      it('should stay at last track when no repeat', () => {
        const lastTrackState = { ...stateWithPlaylist, currentIndex: 2, currentTopic: mockPlaylist[2] };
        const actual = audioReducer(lastTrackState, nextTrack());
        expect(actual.currentIndex).toBe(2);
        expect(actual.currentTopic).toEqual(mockPlaylist[2]);
      });
    });

    describe('previousTrack', () => {
      it('should go to previous track', () => {
        const actual = audioReducer(stateWithPlaylist, previousTrack());
        expect(actual.currentIndex).toBe(0);
        expect(actual.currentTopic).toEqual(mockPlaylist[0]);
        expect(actual.currentPosition).toBe(0);
      });

      it('should stay at current track when repeat mode is one', () => {
        const repeatOneState = { ...stateWithPlaylist, repeatMode: 'one' as const };
        const actual = audioReducer(repeatOneState, previousTrack());
        expect(actual.currentIndex).toBe(1);
        expect(actual.currentTopic).toEqual(mockPlaylist[1]);
      });

      it('should loop to last track when repeat mode is all', () => {
        const firstTrackState = { ...stateWithPlaylist, currentIndex: 0, repeatMode: 'all' as const };
        const actual = audioReducer(firstTrackState, previousTrack());
        expect(actual.currentIndex).toBe(2);
        expect(actual.currentTopic).toEqual(mockPlaylist[2]);
      });

      it('should stay at first track when no repeat', () => {
        const firstTrackState = { ...stateWithPlaylist, currentIndex: 0, currentTopic: mockPlaylist[0] };
        const actual = audioReducer(firstTrackState, previousTrack());
        expect(actual.currentIndex).toBe(0);
        expect(actual.currentTopic).toEqual(mockPlaylist[0]);
      });
    });
  });

  describe('playback modes', () => {
    it('should set repeat mode', () => {
      const actual = audioReducer(initialState, setRepeatMode('all'));
      expect(actual.repeatMode).toBe('all');
    });

    it('should set shuffle mode', () => {
      const actual = audioReducer(initialState, setShuffleMode(true));
      expect(actual.shuffleMode).toBe(true);
    });
  });

  describe('resetPlayback', () => {
    it('should reset all playback state', () => {
      const playingState = {
        ...initialState,
        isPlaying: true,
        currentTopic: mockAudioTopic,
        currentPosition: 150,
        duration: 300,
        playlist: mockPlaylist,
        currentIndex: 1,
        error: 'Some error',
      };

      const actual = audioReducer(playingState, resetPlayback());
      expect(actual).toEqual(initialState);
    });
  });
});