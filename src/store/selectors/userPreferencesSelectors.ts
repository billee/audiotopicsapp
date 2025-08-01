/**
 * User preferences selectors for efficient state access
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Basic selectors
export const selectUserPreferencesState = (state: RootState) => state.userPreferences;
export const selectCategoryPreferences = (state: RootState) => state.userPreferences.categoryPreferences;
export const selectProgressData = (state: RootState) => state.userPreferences.progressData;
export const selectAppSettings = (state: RootState) => state.userPreferences.appSettings;
export const selectLastSyncTime = (state: RootState) => state.userPreferences.lastSyncTime;

// Category preferences selectors
export const selectFavoriteCategories = (state: RootState) => 
  state.userPreferences.categoryPreferences.favoriteCategories;

export const selectRecentlyViewedCategories = (state: RootState) => 
  state.userPreferences.categoryPreferences.recentlyViewed;

export const selectCategorySortOrder = (state: RootState) => 
  state.userPreferences.categoryPreferences.sortOrder;

// App settings selectors
export const selectTheme = (state: RootState) => state.userPreferences.appSettings.theme;
export const selectAutoPlay = (state: RootState) => state.userPreferences.appSettings.autoPlay;
export const selectDownloadQuality = (state: RootState) => state.userPreferences.appSettings.downloadQuality;
export const selectBackgroundPlayback = (state: RootState) => state.userPreferences.appSettings.backgroundPlayback;
export const selectSkipSilence = (state: RootState) => state.userPreferences.appSettings.skipSilence;
export const selectSleepTimer = (state: RootState) => state.userPreferences.appSettings.sleepTimer;

// Progress data selectors
export const selectUserTopicProgress = createSelector(
  [selectProgressData, (state: RootState, topicId: string) => topicId],
  (progressData, topicId) => {
    return progressData[topicId] || null;
  }
);

export const selectTopicPosition = createSelector(
  [selectProgressData, (state: RootState, topicId: string) => topicId],
  (progressData, topicId) => {
    return progressData[topicId]?.position || 0;
  }
);

export const selectIsTopicCompleted = createSelector(
  [selectProgressData, (state: RootState, topicId: string) => topicId],
  (progressData, topicId) => {
    return progressData[topicId]?.completed || false;
  }
);

export const selectTopicPlayCount = createSelector(
  [selectProgressData, (state: RootState, topicId: string) => topicId],
  (progressData, topicId) => {
    return progressData[topicId]?.playCount || 0;
  }
);

export const selectUserCompletedTopics = createSelector(
  [selectProgressData],
  (progressData) => {
    return Object.values(progressData)
      .filter(progress => progress.completed)
      .map(progress => progress.topicId);
  }
);

export const selectUserInProgressTopics = createSelector(
  [selectProgressData],
  (progressData) => {
    return Object.values(progressData)
      .filter(progress => !progress.completed && progress.position > 0)
      .sort((a, b) => b.lastPlayed.getTime() - a.lastPlayed.getTime());
  }
);

export const selectUserRecentlyPlayedTopics = createSelector(
  [selectProgressData],
  (progressData) => {
    return Object.values(progressData)
      .filter(progress => progress.playCount > 0)
      .sort((a, b) => b.lastPlayed.getTime() - a.lastPlayed.getTime())
      .slice(0, 10);
  }
);

export const selectMostPlayedTopics = createSelector(
  [selectProgressData],
  (progressData) => {
    return Object.values(progressData)
      .filter(progress => progress.playCount > 0)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);
  }
);

export const selectTotalPlayTime = createSelector(
  [selectProgressData],
  (progressData) => {
    return Object.values(progressData)
      .reduce((total, progress) => total + (progress.position * progress.playCount), 0);
  }
);

export const selectCompletionStats = createSelector(
  [selectProgressData],
  (progressData) => {
    const allTopics = Object.values(progressData);
    const completed = allTopics.filter(progress => progress.completed).length;
    const inProgress = allTopics.filter(progress => !progress.completed && progress.position > 0).length;
    const notStarted = allTopics.filter(progress => progress.position === 0 && !progress.completed).length;
    
    return {
      total: allTopics.length,
      completed,
      inProgress,
      notStarted,
      completionRate: allTopics.length > 0 ? completed / allTopics.length : 0,
    };
  }
);

// Computed selectors
export const selectIsCategoryFavorite = createSelector(
  [selectFavoriteCategories, (state: RootState, categoryId: string) => categoryId],
  (favoriteCategories, categoryId) => {
    return favoriteCategories.includes(categoryId);
  }
);

export const selectHasSleepTimer = createSelector(
  [selectSleepTimer],
  (sleepTimer) => sleepTimer !== null && sleepTimer > 0
);

export const selectNeedsSyncUpdate = createSelector(
  [selectLastSyncTime],
  (lastSyncTime) => {
    if (!lastSyncTime) return true;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return lastSyncTime < oneHourAgo;
  }
);