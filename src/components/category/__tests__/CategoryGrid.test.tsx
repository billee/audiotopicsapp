/**
 * CategoryGrid component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryGrid from '../CategoryGrid';
import { Category } from '../../../types';

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

describe('CategoryGrid', () => {
  const mockOnCategorySelect = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    mockOnCategorySelect.mockClear();
    mockOnRefresh.mockClear();
  });

  it('renders all categories', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategorySelect={mockOnCategorySelect}
      />
    );

    expect(getByText('Technology')).toBeTruthy();
    expect(getByText('Science')).toBeTruthy();
  });

  it('calls onCategorySelect when a category is pressed', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategorySelect={mockOnCategorySelect}
      />
    );

    fireEvent.press(getByText('Technology'));
    expect(mockOnCategorySelect).toHaveBeenCalledWith(mockCategories[0]);
  });

  it('renders empty list when no categories provided', () => {
    const { queryByText } = render(
      <CategoryGrid
        categories={[]}
        onCategorySelect={mockOnCategorySelect}
      />
    );

    expect(queryByText('Technology')).toBeNull();
    expect(queryByText('Science')).toBeNull();
  });

  it('handles refresh functionality', () => {
    const { getByTestId } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategorySelect={mockOnCategorySelect}
        refreshing={false}
        onRefresh={mockOnRefresh}
      />
    );

    // Note: Testing pull-to-refresh requires more complex setup
    // This is a placeholder for the refresh functionality test
  });

  it('shows refreshing state', () => {
    const { getByTestId } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategorySelect={mockOnCategorySelect}
        refreshing={true}
        onRefresh={mockOnRefresh}
      />
    );

    // Note: Testing the refreshing indicator requires checking FlatList props
    // This would need additional setup or mocking
  });

  it('renders categories in a 2-column grid', () => {
    const { getByTestId } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategorySelect={mockOnCategorySelect}
      />
    );

    // Note: Testing the numColumns prop would require accessing the FlatList
    // This is more of an integration test concern
  });
});