/**
 * Categories selectors for efficient state access
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

// Computed selectors
export const selectSelectedCategory = createSelector(
  [selectCategories, selectSelectedCategoryId],
  (categories, selectedId) => {
    if (!selectedId) return null;
    return categories.find(category => category.id === selectedId) || null;
  }
);

export const selectCategoryById = createSelector(
  [selectCategories, (state: RootState, categoryId: string) => categoryId],
  (categories, categoryId) => {
    return categories.find(category => category.id === categoryId) || null;
  }
);

export const selectCategoriesByIds = createSelector(
  [selectCategories, (state: RootState, categoryIds: string[]) => categoryIds],
  (categories, categoryIds) => {
    return categoryIds
      .map(id => categories.find(category => category.id === id))
      .filter(Boolean);
  }
);

export const selectSortedCategories = createSelector(
  [selectCategories, (state: RootState, sortOrder: 'alphabetical' | 'recent' | 'popular') => sortOrder],
  (categories, sortOrder) => {
    const sortedCategories = [...categories];
    
    switch (sortOrder) {
      case 'alphabetical':
        return sortedCategories.sort((a, b) => a.name.localeCompare(b.name));
      case 'popular':
        return sortedCategories.sort((a, b) => b.topicCount - a.topicCount);
      case 'recent':
      default:
        return sortedCategories; // Assume they're already in recent order
    }
  }
);

export const selectCategoriesWithTopics = createSelector(
  [selectCategories],
  (categories) => {
    return categories.filter(category => category.topicCount > 0);
  }
);

export const selectEmptyCategories = createSelector(
  [selectCategories],
  (categories) => {
    return categories.filter(category => category.topicCount === 0);
  }
);

export const selectTotalTopicsCount = createSelector(
  [selectCategories],
  (categories) => {
    return categories.reduce((total, category) => total + category.topicCount, 0);
  }
);

export const selectCategoriesCount = createSelector(
  [selectCategories],
  (categories) => categories.length
);

export const selectHasCategories = createSelector(
  [selectCategories],
  (categories) => categories.length > 0
);

export const selectCategoriesNeedUpdate = createSelector(
  [selectCategoriesLastUpdated],
  (lastUpdated) => {
    if (!lastUpdated) return true;
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return lastUpdated < fiveMinutesAgo;
  }
);

export const selectCategoryColors = createSelector(
  [selectCategories],
  (categories) => {
    return categories.reduce((colors, category) => {
      colors[category.id] = category.color;
      return colors;
    }, {} as Record<string, string>);
  }
);