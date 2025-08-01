/**
 * Custom hook for category operations
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  selectSelectedCategory,
  selectCategoriesLastUpdated,
} from '../store/selectors/categorySelectors';
import {
  setSelectedCategory,
  clearCategoriesError,
} from '../store/slices/categoriesSlice';
import {
  fetchCategories,
  fetchCategoryById,
  searchCategories,
  fetchCategoriesByPopularity,
} from '../store/thunks/categoryThunks';
import { Category } from '../types';

export const useCategories = () => {
  const dispatch = useAppDispatch();
  
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const lastUpdated = useAppSelector(selectCategoriesLastUpdated);

  // Load categories
  const loadCategories = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Load categories by popularity
  const loadCategoriesByPopularity = useCallback(() => {
    dispatch(fetchCategoriesByPopularity());
  }, [dispatch]);

  // Load specific category
  const loadCategory = useCallback((categoryId: string) => {
    dispatch(fetchCategoryById(categoryId));
  }, [dispatch]);

  // Search categories
  const searchCategoriesQuery = useCallback((query: string) => {
    dispatch(searchCategories(query));
  }, [dispatch]);

  // Select category
  const selectCategoryById = useCallback((categoryId: string | null) => {
    dispatch(setSelectedCategory(categoryId));
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch(clearCategoriesError());
  }, [dispatch]);

  // Refresh categories (force reload)
  const refreshCategories = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto-load categories on mount if not loaded
  useEffect(() => {
    if (categories.length === 0 && !loading && !error) {
      loadCategories();
    }
  }, [categories.length, loading, error, loadCategories]);

  // Check if data is stale (older than 5 minutes)
  const isDataStale = useCallback(() => {
    if (!lastUpdated) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastUpdated > fiveMinutes;
  }, [lastUpdated]);

  return {
    // State
    categories,
    loading,
    error,
    selectedCategory,
    lastUpdated,
    
    // Actions
    loadCategories,
    loadCategoriesByPopularity,
    loadCategory,
    searchCategories: searchCategoriesQuery,
    selectCategory: selectCategoryById,
    clearError,
    refreshCategories,
    
    // Utilities
    isDataStale,
    hasCategories: categories.length > 0,
    isEmpty: categories.length === 0 && !loading,
  };
};