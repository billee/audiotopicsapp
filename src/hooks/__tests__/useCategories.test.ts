/**
 * useCategories hook tests
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCategories } from '../useCategories';
import categoriesReducer from '../../store/slices/categoriesSlice';
import { Category } from '../../types';
import React from 'react';

// Mock the CategoryService
jest.mock('../../services/CategoryService', () => {
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Technology',
      description: 'Latest tech trends',
      iconUrl: 'https://example.com/tech.png',
      backgroundImageUrl: 'https://example.com/tech-bg.jpg',
      topicCount: 15,
      color: '#4A90E2',
    },
  ];

  return {
    __esModule: true,
    default: {
      getInstance: () => ({
        getCategories: jest.fn().mockResolvedValue(mockCategories),
        getCategoryById: jest.fn().mockResolvedValue(mockCategories[0]),
        searchCategories: jest.fn().mockResolvedValue(mockCategories),
        getCategoriesByPopularity: jest.fn().mockResolvedValue(mockCategories),
      }),
    },
  };
});

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      categories: categoriesReducer,
      audio: (state = {}) => state,
      userPreferences: (state = {}) => state,
    },
    preloadedState: {
      categories: {
        categories: [],
        selectedCategoryId: null,
        loading: false,
        error: null,
        lastUpdated: null,
        ...initialState,
      },
    },
  });
};

const createWrapper = (initialState = {}) => {
  const store = createTestStore(initialState);
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(Provider, { store }, children)
  );
};

describe('useCategories', () => {
  it('returns initial state correctly', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.selectedCategory).toBe(null);
    expect(result.current.hasCategories).toBe(false);
    expect(result.current.isEmpty).toBe(true);
  });

  it('loads categories automatically when empty', async () => {
    const wrapper = createWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useCategories(), { wrapper });

    // The hook should automatically load categories
    await waitForNextUpdate();

    expect(result.current.loading).toBe(true);
  });

  it('provides correct utility flags', () => {
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Technology',
        description: 'Latest tech trends',
        iconUrl: 'https://example.com/tech.png',
        backgroundImageUrl: 'https://example.com/tech-bg.jpg',
        topicCount: 15,
        color: '#4A90E2',
      },
    ];

    const wrapper = createWrapper({ categories: mockCategories });
    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.hasCategories).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('detects stale data correctly', () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const wrapper = createWrapper({ lastUpdated: oneHourAgo });
    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.isDataStale()).toBe(true);
  });

  it('detects fresh data correctly', () => {
    const oneMinuteAgo = Date.now() - (60 * 1000);
    const wrapper = createWrapper({ lastUpdated: oneMinuteAgo });
    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.isDataStale()).toBe(false);
  });

  it('provides action functions', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(typeof result.current.loadCategories).toBe('function');
    expect(typeof result.current.loadCategoriesByPopularity).toBe('function');
    expect(typeof result.current.loadCategory).toBe('function');
    expect(typeof result.current.searchCategories).toBe('function');
    expect(typeof result.current.selectCategory).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.refreshCategories).toBe('function');
  });

  it('handles category selection', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCategories(), { wrapper });

    act(() => {
      result.current.selectCategory('1');
    });

    // Note: To fully test this, we'd need to check the Redux state
    // This would require additional setup or mocking
  });

  it('handles error clearing', () => {
    const wrapper = createWrapper({ error: 'Test error' });
    const { result } = renderHook(() => useCategories(), { wrapper });

    act(() => {
      result.current.clearError();
    });

    // Note: To fully test this, we'd need to check the Redux state
    // This would require additional setup or mocking
  });
});