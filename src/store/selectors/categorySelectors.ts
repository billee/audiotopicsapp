/**
 * Category selectors for accessing category state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Basic selectors
export const selectCategoriesState = (state: RootState) => state.categories;

export const selectCategories = (state: RootState) => state.categories.categories;

export const selectSelectedCategoryId = (state: RootState) => state.categories.selectedCategoryId;

export const selectCategoriesLoading = (state: RootState) => state.categories.loading;

export const selectCategoriesError = (state: RootState) => state.categories.error;

export const selectCategoriesLastUpdated = (state: RootState) => state.categories.lastUpdated;

// Memoized selectors
export const selectSelectedCategory = createSelector(
  [selectCategories, selectSelectedCategoryId],
  (categories, selectedId) => {
    if (!selectedId) return null;
    return categories.find(category => category.id === selectedId) || null;
  }
);

export const selectCategoriesByName = createSelector(
  [selectCategories],
  (categories) => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }
);

export const selectCategoriesByPopularity = createSelector(
  [selectCategories],
  (categories) => {
    return [...categories].sort((a, b) => b.topicCount - a.topicCount);
  }
);

export const selectCategoryById = (categoryId: string) =>
  createSelector(
    [selectCategories],
    (categories) => categories.find(category => category.id === categoryId) || null
  );

export const selectCategoriesWithTopics = createSelector(
  [selectCategories],
  (categories) => categories.filter(category => category.topicCount > 0)
);

export const selectCategoriesCount = createSelector(
  [selectCategories],
  (categories) => categories.length
);

export const selectTotalTopicsCount = createSelector(
  [selectCategories],
  (categories) => categories.reduce((total, category) => total + category.topicCount, 0)
);