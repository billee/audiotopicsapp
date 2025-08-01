/**
 * Custom hook for managing topics state and operations
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCurrentCategoryTopics,
  selectTopicsSelectedCategoryId,
  selectTopicsLoading,
  selectTopicsError,
  selectTopicsWithProgress,
  selectTopicStats,
  selectHasTopicsData,
  selectIsTopicsEmpty,
} from '../store/selectors/topicsSelectors';
import {
  loadTopicsByCategory,
  loadTopics,
  searchTopics,
  loadTopicsByDate,
  loadTopicsByDuration,
} from '../store/thunks/topicThunks';
import { clearError, setSelectedCategoryId } from '../store/slices/topicsSlice';

export const useTopics = (categoryId?: string) => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const topics = useAppSelector(selectCurrentCategoryTopics);
  const topicsWithProgress = useAppSelector(selectTopicsWithProgress);
  const selectedCategoryId = useAppSelector(selectTopicsSelectedCategoryId);
  const loading = useAppSelector(selectTopicsLoading);
  const error = useAppSelector(selectTopicsError);
  const stats = useAppSelector(selectTopicStats);
  const hasData = useAppSelector(selectHasTopicsData);
  const isEmpty = useAppSelector(selectIsTopicsEmpty);

  // Actions
  const loadTopicsForCategory = useCallback(
    (categoryId: string) => {
      dispatch(loadTopicsByCategory(categoryId));
    },
    [dispatch]
  );

  const loadAllTopics = useCallback(() => {
    dispatch(loadTopics());
  }, [dispatch]);

  const searchTopicsQuery = useCallback(
    (query: string) => {
      dispatch(searchTopics(query));
    },
    [dispatch]
  );

  const loadTopicsSortedByDate = useCallback(() => {
    dispatch(loadTopicsByDate());
  }, [dispatch]);

  const loadTopicsSortedByDuration = useCallback(
    (ascending: boolean = true) => {
      dispatch(loadTopicsByDuration(ascending));
    },
    [dispatch]
  );

  const selectCategory = useCallback(
    (categoryId: string | null) => {
      dispatch(setSelectedCategoryId(categoryId));
    },
    [dispatch]
  );

  const clearTopicsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshTopics = useCallback(() => {
    if (selectedCategoryId) {
      loadTopicsForCategory(selectedCategoryId);
    } else {
      loadAllTopics();
    }
  }, [selectedCategoryId, loadTopicsForCategory, loadAllTopics]);

  // Auto-load topics when categoryId changes
  useEffect(() => {
    if (categoryId && categoryId !== selectedCategoryId) {
      loadTopicsForCategory(categoryId);
    }
  }, [categoryId, selectedCategoryId, loadTopicsForCategory]);

  return {
    // Data
    topics,
    topicsWithProgress,
    selectedCategoryId,
    stats,
    
    // State
    loading,
    error,
    hasData,
    isEmpty,
    
    // Actions
    loadTopicsForCategory,
    loadAllTopics,
    searchTopicsQuery,
    loadTopicsSortedByDate,
    loadTopicsSortedByDuration,
    selectCategory,
    clearTopicsError,
    refreshTopics,
  };
};