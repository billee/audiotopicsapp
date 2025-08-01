/**
 * Tests for Redux selectors
 */

import { RootState } from '../../src/store';
import { selectCompletedTopics } from '../../src/store/selectors';
import { selectTopicProgress } from '../../src/store/selectors';
import { selectTopicProgress } from '../../src/store/selectors';
import {
  selectPlaybackProgress,
  selectFormattedCurrentTime,
  selectFormattedDuration,
  selectHasNextTrack,
  selectHasPreviousTrack,
  selectCanPlay,
} from '../../src/store/selectors/audioSelectors';
import {
  selectSelectedCategory,
  selectCategoryById,
  selectSortedCategories,
  selectTotalTopicsCount,
} from '../../src/store/selectors/categoriesSelectors';
import {
  selectUserTopicProgress,
  selectIsTopicCompleted,
  selectUserCompletedTopics,
  selectIsCategoryFavorite,
} from '../../src/store/selectors/userPreferencesSelectors';
import { AudioTopic, Category, ProgressData } from '../../src/types';

const mockAudioTopic: AudioTopic = {
  id: '1',
  title: 'Test Topic',
  description: 'Test Description',
  categoryId: 'cat1',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 300,
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 5000000,
  },
};

const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Category A',
    description: 'First category',
    topicCount: 5,
    color: '#FF0000',
  },
  {
    id: 'cat2',
    name: 'Category B',
    description: 'Second category',
    topicCount: 3,
    color: '#00FF00',
  },
  {
    id: 'cat3',
    name: 'Category C',
    description: 'Third category',
    topicCount: 8,
    color: '#0000FF',
  },
];

const mockProgressData: Record<string, ProgressData> = {
  topic1: {
    topicId: 'topic1',
    position: 150,
    completed: true,
    lastPlayed: new Date('2023-01-01'),
    playCount: 2,
  },
  topic2: {
    topicId: 'topic2',
    position: 50,
    completed: false,
    lastPlayed: new Date('2023-01-02'),
    playCount: 1,
  },
};

const createMockState = (overrides: Partial<RootState> = {}): RootState => ({
  audio: {
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
    repeatMode: 'none',
    shuffleMode: false,
  },
  categories: {
    categories: [],
    selectedCategoryId: null,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  userPreferences: {
    categoryPreferences: {
      favoriteCategories: [],
      recentlyViewed: [],
      sortOrder: 'alphabetical',
    },
    progressData: {},
    appSettings: {
      theme: 'auto',
      autoPlay: true,
      downloadQuality: 'medium',
      backgroundPlayback: true,
      skipSilence: false,
      sleepTimer: null,
    },
    lastSyncTime: null,
  },
  ...overrides,
});

describe('Redux Selectors', () => {
  describe('Audio Selectors', () => {
    describe('selectPlaybackProgress', () => {
      it('should return 0 when duration is 0', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentPosition: 100,
            duration: 0,
          },
        });
        
        expect(selectPlaybackProgress(state)).toBe(0);
      });

      it('should calculate progress correctly', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentPosition: 150,
            duration: 300,
          },
        });
        
        expect(selectPlaybackProgress(state)).toBe(0.5);
      });

      it('should not exceed 1', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentPosition: 400,
            duration: 300,
          },
        });
        
        expect(selectPlaybackProgress(state)).toBe(1);
      });
    });

    describe('selectFormattedCurrentTime', () => {
      it('should format time correctly', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentPosition: 125, // 2:05
          },
        });
        
        expect(selectFormattedCurrentTime(state)).toBe('2:05');
      });

      it('should pad seconds with zero', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentPosition: 65, // 1:05
          },
        });
        
        expect(selectFormattedCurrentTime(state)).toBe('1:05');
      });
    });

    describe('selectFormattedDuration', () => {
      it('should format duration correctly', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            duration: 185, // 3:05
          },
        });
        
        expect(selectFormattedDuration(state)).toBe('3:05');
      });
    });

    describe('selectHasNextTrack', () => {
      it('should return false for empty playlist', () => {
        const state = createMockState();
        expect(selectHasNextTrack(state)).toBe(false);
      });

      it('should return true when repeat mode is all', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            playlist: [mockAudioTopic],
            currentIndex: 0,
            repeatMode: 'all',
          },
        });
        
        expect(selectHasNextTrack(state)).toBe(true);
      });

      it('should return false at end of playlist with no repeat', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            playlist: [mockAudioTopic],
            currentIndex: 0,
            repeatMode: 'none',
          },
        });
        
        expect(selectHasNextTrack(state)).toBe(false);
      });
    });

    describe('selectCanPlay', () => {
      it('should return false when no current topic', () => {
        const state = createMockState();
        expect(selectCanPlay(state)).toBe(false);
      });

      it('should return false when loading', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentTopic: mockAudioTopic,
            isLoading: true,
          },
        });
        
        expect(selectCanPlay(state)).toBe(false);
      });

      it('should return false when error exists', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentTopic: mockAudioTopic,
            error: 'Some error',
          },
        });
        
        expect(selectCanPlay(state)).toBe(false);
      });

      it('should return true when ready to play', () => {
        const state = createMockState({
          audio: {
            ...createMockState().audio,
            currentTopic: mockAudioTopic,
            isLoading: false,
            error: null,
          },
        });
        
        expect(selectCanPlay(state)).toBe(true);
      });
    });
  });

  describe('Categories Selectors', () => {
    describe('selectSelectedCategory', () => {
      it('should return null when no category selected', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
          },
        });
        
        expect(selectSelectedCategory(state)).toBeNull();
      });

      it('should return selected category', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
            selectedCategoryId: 'cat2',
          },
        });
        
        expect(selectSelectedCategory(state)).toEqual(mockCategories[1]);
      });
    });

    describe('selectCategoryById', () => {
      it('should return category by id', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
          },
        });
        
        expect(selectCategoryById(state, 'cat2')).toEqual(mockCategories[1]);
      });

      it('should return null for non-existent category', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
          },
        });
        
        expect(selectCategoryById(state, 'non-existent')).toBeNull();
      });
    });

    describe('selectSortedCategories', () => {
      it('should sort alphabetically', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
          },
        });
        
        const sorted = selectSortedCategories(state, 'alphabetical');
        expect(sorted[0].name).toBe('Category A');
        expect(sorted[1].name).toBe('Category B');
        expect(sorted[2].name).toBe('Category C');
      });

      it('should sort by popularity (topic count)', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
          },
        });
        
        const sorted = selectSortedCategories(state, 'popular');
        expect(sorted[0].topicCount).toBe(8); // Category C
        expect(sorted[1].topicCount).toBe(5); // Category A
        expect(sorted[2].topicCount).toBe(3); // Category B
      });
    });

    describe('selectTotalTopicsCount', () => {
      it('should sum all topic counts', () => {
        const state = createMockState({
          categories: {
            ...createMockState().categories,
            categories: mockCategories,
          },
        });
        
        expect(selectTotalTopicsCount(state)).toBe(16); // 5 + 3 + 8
      });
    });
  });

  describe('User Preferences Selectors', () => {
    describe('selectTopicProgress', () => {
      it('should return progress data for topic', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            progressData: mockProgressData,
          },
        });
        
        expect(selectTopicProgress(state, 'topic1')).toEqual(mockProgressData.topic1);
      });

      it('should return null for non-existent topic', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            progressData: mockProgressData,
          },
        });
        
        expect(selectTopicProgress(state, 'non-existent')).toBeNull();
      });
    });

    describe('selectIsTopicCompleted', () => {
      it('should return true for completed topic', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            progressData: mockProgressData,
          },
        });
        
        expect(selectIsTopicCompleted(state, 'topic1')).toBe(true);
      });

      it('should return false for incomplete topic', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            progressData: mockProgressData,
          },
        });
        
        expect(selectIsTopicCompleted(state, 'topic2')).toBe(false);
      });

      it('should return false for non-existent topic', () => {
        const state = createMockState();
        expect(selectIsTopicCompleted(state, 'non-existent')).toBe(false);
      });
    });

    describe('selectCompletedTopics', () => {
      it('should return array of completed topic IDs', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            progressData: mockProgressData,
          },
        });
        
        const completed = selectCompletedTopics(state);
        expect(completed).toContain('topic1');
        expect(completed).not.toContain('topic2');
      });
    });

    describe('selectIsCategoryFavorite', () => {
      it('should return true for favorite category', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            categoryPreferences: {
              ...createMockState().userPreferences.categoryPreferences,
              favoriteCategories: ['cat1', 'cat2'],
            },
          },
        });
        
        expect(selectIsCategoryFavorite(state, 'cat1')).toBe(true);
      });

      it('should return false for non-favorite category', () => {
        const state = createMockState({
          userPreferences: {
            ...createMockState().userPreferences,
            categoryPreferences: {
              ...createMockState().userPreferences.categoryPreferences,
              favoriteCategories: ['cat1', 'cat2'],
            },
          },
        });
        
        expect(selectIsCategoryFavorite(state, 'cat3')).toBe(false);
      });
    });
  });
});