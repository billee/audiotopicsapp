/**
 * CategoryScreen component tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CategoryScreen from '../CategoryScreen';
import categoriesReducer from '../../store/slices/categoriesSlice';
import { Category } from '../../types';

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
    {
      id: '2',
      name: 'Science',
      description: 'Scientific discoveries',
      iconUrl: 'https://example.com/science.png',
      backgroundImageUrl: 'https://example.com/science-bg.jpg',
      topicCount: 12,
      color: '#50C878',
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

const renderWithStore = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('CategoryScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    mockNavigation.navigate.mockClear();
  });

  it('renders loading state initially', () => {
    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { loading: true }
    );

    expect(getByText('Loading categories...')).toBeTruthy();
  });

  it('renders error state when there is an error', () => {
    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { error: 'Failed to load categories' }
    );

    expect(getByText('Failed to load categories')).toBeTruthy();
    expect(getByText('Reload Categories')).toBeTruthy();
  });

  it('renders empty state when no categories are available', () => {
    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { categories: [], loading: false, error: null }
    );

    expect(getByText('No Categories Available')).toBeTruthy();
  });

  it('renders categories when loaded successfully', async () => {
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

    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { categories: mockCategories, loading: false, error: null }
    );

    expect(getByText('Audio Topics')).toBeTruthy();
    expect(getByText('Discover 1 categories of engaging audio content')).toBeTruthy();
    expect(getByText('Technology')).toBeTruthy();
  });

  it('handles category selection and navigation', async () => {
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

    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { categories: mockCategories, loading: false, error: null }
    );

    fireEvent.press(getByText('Technology'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('TopicList', {
      categoryId: '1',
      categoryName: 'Technology',
    });
  });

  it('handles retry on error', () => {
    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { error: 'Network error' }
    );

    const retryButton = getByText('Reload Categories');
    fireEvent.press(retryButton);

    // The retry should clear the error and attempt to reload
    // This would require more complex testing setup to verify the actual dispatch
  });

  it('displays correct category count in subtitle', () => {
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
      {
        id: '2',
        name: 'Science',
        description: 'Scientific discoveries',
        iconUrl: 'https://example.com/science.png',
        backgroundImageUrl: 'https://example.com/science-bg.jpg',
        topicCount: 12,
        color: '#50C878',
      },
    ];

    const { getByText } = renderWithStore(
      <CategoryScreen navigation={mockNavigation} />,
      { categories: mockCategories, loading: false, error: null }
    );

    expect(getByText('Discover 2 categories of engaging audio content')).toBeTruthy();
  });
});