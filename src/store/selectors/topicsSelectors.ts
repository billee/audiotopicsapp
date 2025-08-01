/**
 * Topics selectors for efficient state access
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { AudioTopic, ProgressData } from '../../types';

// Basic selectors
export const selectTopicsState = (state: RootState) => state.topics;
export const selectAllTopics = (state: RootState) => state.topics.topics;
export const selectTopicsByCategory = (state: RootState) => state.topics.topicsByCategory;
export const selectCurrentCategoryTopics = (state: RootState) => state.topics.currentCategoryTopics;
export const selectTopicsSelectedCategoryId = (state: RootState) => state.topics.selectedCategoryId;
export const selectTopicsLoading = (state: RootState) => state.topics.loading;
export const selectTopicsError = (state: RootState) => state.topics.error;
export const selectTopicsProgressData = (state: RootState) => state.topics.progressData;

// Computed selectors
export const selectTopicsForCategory = createSelector(
  [selectTopicsByCategory, (state: RootState, categoryId: string) => categoryId],
  (topicsByCategory, categoryId) => {
    return topicsByCategory[categoryId] || [];
  }
);

export const selectTopicProgress = createSelector(
  [selectTopicsProgressData, (state: RootState, topicId: string) => topicId],
  (progressData, topicId) => {
    return progressData[topicId] || null;
  }
);

export const selectCompletedTopics = createSelector(
  [selectTopicsProgressData],
  (progressData) => {
    return Object.values(progressData).filter(progress => progress.completed);
  }
);

export const selectInProgressTopics = createSelector(
  [selectTopicsProgressData],
  (progressData) => {
    return Object.values(progressData).filter(progress => 
      !progress.completed && progress.position > 0
    );
  }
);

export const selectTopicsWithProgress = createSelector(
  [selectCurrentCategoryTopics, selectTopicsProgressData],
  (topics, progressData) => {
    return topics.map(topic => ({
      ...topic,
      progress: progressData[topic.id] || null,
      isCompleted: progressData[topic.id]?.completed || false,
      isInProgress: progressData[topic.id] && !progressData[topic.id].completed && progressData[topic.id].position > 0,
      progressPercentage: progressData[topic.id] 
        ? Math.min((progressData[topic.id].position / topic.duration) * 100, 100)
        : 0,
    }));
  }
);

export const selectTopicById = createSelector(
  [selectAllTopics, (state: RootState, topicId: string) => topicId],
  (topics, topicId) => {
    return topics.find(topic => topic.id === topicId) || null;
  }
);

export const selectTopicWithProgress = createSelector(
  [
    (state: RootState, topicId: string) => selectTopicById(state, topicId),
    (state: RootState, topicId: string) => selectTopicProgress(state, topicId)
  ],
  (topic, progress) => {
    if (!topic) return null;
    
    return {
      ...topic,
      progress,
      isCompleted: progress?.completed || false,
      isInProgress: progress && !progress.completed && progress.position > 0,
      progressPercentage: progress 
        ? Math.min((progress.position / topic.duration) * 100, 100)
        : 0,
    };
  }
);

export const selectRecentlyPlayedTopics = createSelector(
  [selectAllTopics, selectTopicsProgressData],
  (topics, progressData) => {
    const recentlyPlayed = Object.values(progressData)
      .filter(progress => progress.position > 0)
      .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
      .slice(0, 10);
    
    return recentlyPlayed
      .map(progress => topics.find(topic => topic.id === progress.topicId))
      .filter(Boolean) as AudioTopic[];
  }
);

export const selectTopicStats = createSelector(
  [selectCurrentCategoryTopics, selectTopicsProgressData],
  (topics, progressData) => {
    const totalTopics = topics.length;
    const completedCount = topics.filter(topic => 
      progressData[topic.id]?.completed
    ).length;
    const inProgressCount = topics.filter(topic => 
      progressData[topic.id] && !progressData[topic.id].completed && progressData[topic.id].position > 0
    ).length;
    const notStartedCount = totalTopics - completedCount - inProgressCount;
    
    const totalDuration = topics.reduce((sum, topic) => sum + topic.duration, 0);
    const completedDuration = topics
      .filter(topic => progressData[topic.id]?.completed)
      .reduce((sum, topic) => sum + topic.duration, 0);
    
    return {
      totalTopics,
      completedCount,
      inProgressCount,
      notStartedCount,
      totalDuration,
      completedDuration,
      completionPercentage: totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0,
    };
  }
);

export const selectHasTopicsData = createSelector(
  [selectCurrentCategoryTopics],
  (topics) => topics.length > 0
);

export const selectIsTopicsEmpty = createSelector(
  [selectCurrentCategoryTopics, selectTopicsLoading],
  (topics, loading) => topics.length === 0 && !loading
);

export const selectTopicsSortedByProgress = createSelector(
  [selectTopicsWithProgress],
  (topicsWithProgress) => {
    return [...topicsWithProgress].sort((a, b) => {
      // Completed topics go to the end
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      // In-progress topics come first
      if (a.isInProgress && !b.isInProgress) return -1;
      if (!a.isInProgress && b.isInProgress) return 1;
      
      // Within same status, sort by progress percentage (descending)
      return b.progressPercentage - a.progressPercentage;
    });
  }
);