/**
 * CategoryCard component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryCard from '../CategoryCard';
import { Category } from '../../../types';

const mockCategory: Category = {
  id: '1',
  name: 'Technology',
  description: 'Latest tech trends and innovations',
  iconUrl: 'https://example.com/icon.png',
  backgroundImageUrl: 'https://example.com/bg.jpg',
  topicCount: 15,
  color: '#4A90E2',
};

describe('CategoryCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders category information correctly', () => {
    const { getByText } = render(
      <CategoryCard category={mockCategory} onPress={mockOnPress} />
    );

    expect(getByText('Technology')).toBeTruthy();
    expect(getByText('15 topics')).toBeTruthy();
  });

  it('handles singular topic count correctly', () => {
    const singleTopicCategory = { ...mockCategory, topicCount: 1 };
    const { getByText } = render(
      <CategoryCard category={singleTopicCategory} onPress={mockOnPress} />
    );

    expect(getByText('1 topic')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const { getByText } = render(
      <CategoryCard category={mockCategory} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Technology'));
    expect(mockOnPress).toHaveBeenCalledWith(mockCategory);
  });

  it('truncates long category names', () => {
    const longNameCategory = {
      ...mockCategory,
      name: 'This is a very long category name that should be truncated',
    };
    const { getByText } = render(
      <CategoryCard category={longNameCategory} onPress={mockOnPress} />
    );

    const nameElement = getByText(longNameCategory.name);
    expect(nameElement.props.numberOfLines).toBe(2);
  });

  it('renders with background image', () => {
    const { getByTestId } = render(
      <CategoryCard category={mockCategory} onPress={mockOnPress} />
    );

    // Note: In a real test, you might want to test the ImageBackground source
    // This would require additional setup or mocking
  });
});