/**
 * Tests for user preferences slice
 */

import userPreferencesReducer, {
  addFavoriteCategory,
  removeFavoriteCategory,
  addRecentlyViewedCategory,
  setCategorySortOrder,
  setCategoryPreferences,
  updateProgress,
  markTopicCompleted,
  incrementPlayCount,
  clearProgress,
  clearAllProgress,
  setTheme,
  setAutoPlay,
  setDownloadQuality,
  setBackgroundPlayback,
  setSkipSilence,
  setSleepTimer,
  updateAppSettings,
  setLastSyncTime,
  resetUserPreferences,
} from '../../src/store/slices/userPreferencesSlice';
import { ProgressData, CategoryPreferences } from '../../src/types';

const mockProgressData: ProgressData = {
  topicId: 'topic1',
  position: 150,
  completed: false,
  lastPlayed: new Date('2023-01-01'),
  playCount: 1,
};

const mockCategoryPreferences: CategoryPreferences = {
  favoriteCategories: ['cat1', 'cat2'],
  recentlyViewed: ['cat3', 'cat1'],
  sortOrder: 'popular',
};

describe('userPreferencesSlice', () => {
  const initialState = {
    categoryPreferences: {
      favoriteCategories: [],
      recentlyViewed: [],
      sortOrder: 'alphabetical' as const,
    },
    progressData: {},
    appSettings: {
      theme: 'auto' as const,
      autoPlay: true,
      downloadQuality: 'medium' as const,
      backgroundPlayback: true,
      skipSilence: false,
      sleepTimer: null,
    },
    lastSyncTime: null,
  };

  it('should return the initial state', () => {
    expect(userPreferencesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('category preferences', () => {
    describe('addFavoriteCategory', () => {
      it('should add category to favorites', () => {
        const actual = userPreferencesReducer(initialState, addFavoriteCategory('cat1'));
        expect(actual.categoryPreferences.favoriteCategories).toContain('cat1');
      });

      it('should not add duplicate category', () => {
        const stateWithFavorite = {
          ...initialState,
          categoryPreferences: {
            ...initialState.categoryPreferences,
            favoriteCategories: ['cat1'],
          },
        };
        
        const actual = userPreferencesReducer(stateWithFavorite, addFavoriteCategory('cat1'));
        expect(actual.categoryPreferences.favoriteCategories).toEqual(['cat1']);
      });
    });

    describe('removeFavoriteCategory', () => {
      it('should remove category from favorites', () => {
        const stateWithFavorites = {
          ...initialState,
          categoryPreferences: {
            ...initialState.categoryPreferences,
            favoriteCategories: ['cat1', 'cat2'],
          },
        };
        
        const actual = userPreferencesReducer(stateWithFavorites, removeFavoriteCategory('cat1'));
        expect(actual.categoryPreferences.favoriteCategories).toEqual(['cat2']);
      });
    });

    describe('addRecentlyViewedCategory', () => {
      it('should add category to recently viewed', () => {
        const actual = userPreferencesReducer(initialState, addRecentlyViewedCategory('cat1'));
        expect(actual.categoryPreferences.recentlyViewed).toEqual(['cat1']);
      });

      it('should move existing category to front', () => {
        const stateWithRecent = {
          ...initialState,
          categoryPreferences: {
            ...initialState.categoryPreferences,
            recentlyViewed: ['cat1', 'cat2', 'cat3'],
          },
        };
        
        const actual = userPreferencesReducer(stateWithRecent, addRecentlyViewedCategory('cat2'));
        expect(actual.categoryPreferences.recentlyViewed).toEqual(['cat2', 'cat1', 'cat3']);
      });

      it('should limit recently viewed to 10 items', () => {
        const stateWithManyRecent = {
          ...initialState,
          categoryPreferences: {
            ...initialState.categoryPreferences,
            recentlyViewed: Array.from({ length: 10 }, (_, i) => `cat${i}`),
          },
        };
        
        const actual = userPreferencesReducer(stateWithManyRecent, addRecentlyViewedCategory('newCat'));
        expect(actual.categoryPreferences.recentlyViewed).toHaveLength(10);
        expect(actual.categoryPreferences.recentlyViewed[0]).toBe('newCat');
      });
    });

    describe('setCategorySortOrder', () => {
      it('should set sort order', () => {
        const actual = userPreferencesReducer(initialState, setCategorySortOrder('popular'));
        expect(actual.categoryPreferences.sortOrder).toBe('popular');
      });
    });

    describe('setCategoryPreferences', () => {
      it('should set entire category preferences', () => {
        const actual = userPreferencesReducer(initialState, setCategoryPreferences(mockCategoryPreferences));
        expect(actual.categoryPreferences).toEqual(mockCategoryPreferences);
      });
    });
  });

  describe('progress data', () => {
    describe('updateProgress', () => {
      it('should update progress data', () => {
        const actual = userPreferencesReducer(initialState, updateProgress(mockProgressData));
        expect(actual.progressData['topic1']).toEqual(mockProgressData);
      });

      it('should overwrite existing progress data', () => {
        const stateWithProgress = {
          ...initialState,
          progressData: { topic1: mockProgressData },
        };
        
        const updatedProgress = { ...mockProgressData, position: 200 };
        const actual = userPreferencesReducer(stateWithProgress, updateProgress(updatedProgress));
        expect(actual.progressData['topic1'].position).toBe(200);
      });
    });

    describe('markTopicCompleted', () => {
      it('should mark existing topic as completed', () => {
        const stateWithProgress = {
          ...initialState,
          progressData: { topic1: mockProgressData },
        };
        
        const actual = userPreferencesReducer(stateWithProgress, markTopicCompleted('topic1'));
        expect(actual.progressData['topic1'].completed).toBe(true);
        expect(actual.progressData['topic1'].lastPlayed).toBeInstanceOf(Date);
      });

      it('should create new progress data for new topic', () => {
        const actual = userPreferencesReducer(initialState, markTopicCompleted('newTopic'));
        expect(actual.progressData['newTopic']).toBeDefined();
        expect(actual.progressData['newTopic'].completed).toBe(true);
        expect(actual.progressData['newTopic'].playCount).toBe(1);
      });
    });

    describe('incrementPlayCount', () => {
      it('should increment play count for existing topic', () => {
        const stateWithProgress = {
          ...initialState,
          progressData: { topic1: mockProgressData },
        };
        
        const actual = userPreferencesReducer(stateWithProgress, incrementPlayCount('topic1'));
        expect(actual.progressData['topic1'].playCount).toBe(2);
        expect(actual.progressData['topic1'].lastPlayed).toBeInstanceOf(Date);
      });

      it('should create new progress data for new topic', () => {
        const actual = userPreferencesReducer(initialState, incrementPlayCount('newTopic'));
        expect(actual.progressData['newTopic']).toBeDefined();
        expect(actual.progressData['newTopic'].playCount).toBe(1);
      });
    });

    describe('clearProgress', () => {
      it('should clear progress for specific topic', () => {
        const stateWithProgress = {
          ...initialState,
          progressData: { topic1: mockProgressData, topic2: mockProgressData },
        };
        
        const actual = userPreferencesReducer(stateWithProgress, clearProgress('topic1'));
        expect(actual.progressData['topic1']).toBeUndefined();
        expect(actual.progressData['topic2']).toBeDefined();
      });
    });

    describe('clearAllProgress', () => {
      it('should clear all progress data', () => {
        const stateWithProgress = {
          ...initialState,
          progressData: { topic1: mockProgressData, topic2: mockProgressData },
        };
        
        const actual = userPreferencesReducer(stateWithProgress, clearAllProgress());
        expect(actual.progressData).toEqual({});
      });
    });
  });

  describe('app settings', () => {
    it('should set theme', () => {
      const actual = userPreferencesReducer(initialState, setTheme('dark'));
      expect(actual.appSettings.theme).toBe('dark');
    });

    it('should set auto play', () => {
      const actual = userPreferencesReducer(initialState, setAutoPlay(false));
      expect(actual.appSettings.autoPlay).toBe(false);
    });

    it('should set download quality', () => {
      const actual = userPreferencesReducer(initialState, setDownloadQuality('high'));
      expect(actual.appSettings.downloadQuality).toBe('high');
    });

    it('should set background playback', () => {
      const actual = userPreferencesReducer(initialState, setBackgroundPlayback(false));
      expect(actual.appSettings.backgroundPlayback).toBe(false);
    });

    it('should set skip silence', () => {
      const actual = userPreferencesReducer(initialState, setSkipSilence(true));
      expect(actual.appSettings.skipSilence).toBe(true);
    });

    it('should set sleep timer', () => {
      const actual = userPreferencesReducer(initialState, setSleepTimer(30));
      expect(actual.appSettings.sleepTimer).toBe(30);
    });

    it('should update multiple app settings', () => {
      const updates = { theme: 'light' as const, autoPlay: false };
      const actual = userPreferencesReducer(initialState, updateAppSettings(updates));
      expect(actual.appSettings.theme).toBe('light');
      expect(actual.appSettings.autoPlay).toBe(false);
      expect(actual.appSettings.downloadQuality).toBe('medium'); // Unchanged
    });
  });

  describe('sync', () => {
    it('should set last sync time', () => {
      const timestamp = Date.now();
      const actual = userPreferencesReducer(initialState, setLastSyncTime(timestamp));
      expect(actual.lastSyncTime).toBe(timestamp);
    });
  });

  describe('resetUserPreferences', () => {
    it('should reset all preferences to initial state', () => {
      const complexState = {
        categoryPreferences: mockCategoryPreferences,
        progressData: { topic1: mockProgressData },
        appSettings: {
          theme: 'dark' as const,
          autoPlay: false,
          downloadQuality: 'high' as const,
          backgroundPlayback: false,
          skipSilence: true,
          sleepTimer: 30,
        },
        lastSyncTime: Date.now(),
      };

      const actual = userPreferencesReducer(complexState, resetUserPreferences());
      expect(actual).toEqual(initialState);
    });
  });
});