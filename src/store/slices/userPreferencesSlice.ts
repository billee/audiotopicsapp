/**
 * User preferences slice for managing user settings and preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryPreferences, ProgressData } from '../../types';

interface UserPreferencesState {
  categoryPreferences: CategoryPreferences;
  progressData: Record<string, ProgressData>;
  appSettings: {
    theme: 'light' | 'dark' | 'auto';
    autoPlay: boolean;
    downloadQuality: 'low' | 'medium' | 'high';
    backgroundPlayback: boolean;
    skipSilence: boolean;
    sleepTimer: number | null; // minutes
  };
  lastSyncTime: number | null;
}

const initialState: UserPreferencesState = {
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
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    // Category preferences
    addFavoriteCategory: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      if (!state.categoryPreferences.favoriteCategories.includes(categoryId)) {
        state.categoryPreferences.favoriteCategories.push(categoryId);
      }
    },
    
    removeFavoriteCategory: (state, action: PayloadAction<string>) => {
      state.categoryPreferences.favoriteCategories = 
        state.categoryPreferences.favoriteCategories.filter(id => id !== action.payload);
    },
    
    addRecentlyViewedCategory: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      const recentlyViewed = state.categoryPreferences.recentlyViewed;
      
      // Remove if already exists
      const filteredRecent = recentlyViewed.filter(id => id !== categoryId);
      
      // Add to beginning and limit to 10 items
      state.categoryPreferences.recentlyViewed = [categoryId, ...filteredRecent].slice(0, 10);
    },
    
    setCategorySortOrder: (state, action: PayloadAction<'alphabetical' | 'recent' | 'popular'>) => {
      state.categoryPreferences.sortOrder = action.payload;
    },
    
    setCategoryPreferences: (state, action: PayloadAction<CategoryPreferences>) => {
      state.categoryPreferences = action.payload;
    },
    
    // Progress data
    updateProgress: (state, action: PayloadAction<ProgressData>) => {
      const progressData = action.payload;
      state.progressData[progressData.topicId] = progressData;
    },
    
    markTopicCompleted: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      if (state.progressData[topicId]) {
        state.progressData[topicId].completed = true;
        state.progressData[topicId].lastPlayed = new Date();
      } else {
        state.progressData[topicId] = {
          topicId,
          position: 0,
          completed: true,
          lastPlayed: new Date(),
          playCount: 1,
        };
      }
    },
    
    incrementPlayCount: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      if (state.progressData[topicId]) {
        state.progressData[topicId].playCount += 1;
        state.progressData[topicId].lastPlayed = new Date();
      } else {
        state.progressData[topicId] = {
          topicId,
          position: 0,
          completed: false,
          lastPlayed: new Date(),
          playCount: 1,
        };
      }
    },
    
    clearProgress: (state, action: PayloadAction<string>) => {
      delete state.progressData[action.payload];
    },
    
    clearAllProgress: (state) => {
      state.progressData = {};
    },
    
    // App settings
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.appSettings.theme = action.payload;
    },
    
    setAutoPlay: (state, action: PayloadAction<boolean>) => {
      state.appSettings.autoPlay = action.payload;
    },
    
    setDownloadQuality: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.appSettings.downloadQuality = action.payload;
    },
    
    setBackgroundPlayback: (state, action: PayloadAction<boolean>) => {
      state.appSettings.backgroundPlayback = action.payload;
    },
    
    setSkipSilence: (state, action: PayloadAction<boolean>) => {
      state.appSettings.skipSilence = action.payload;
    },
    
    setSleepTimer: (state, action: PayloadAction<number | null>) => {
      state.appSettings.sleepTimer = action.payload;
    },
    
    updateAppSettings: (state, action: PayloadAction<Partial<UserPreferencesState['appSettings']>>) => {
      state.appSettings = { ...state.appSettings, ...action.payload };
    },
    
    // Sync
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    
    // Reset
    resetUserPreferences: (state) => {
      return initialState;
    },
  },
});

export const {
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
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer;