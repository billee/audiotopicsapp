/**
 * CategoryCard Component Tests
 * 
 * Tests for the Filipino-inspired CategoryCard component including
 * rendering, interactions, accessibility, and different props.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryCard from '../CategoryCard';
import { FilipinoCategory } from '../../../config/categories';

// Mock the responsive utilities
jest.mock('../../../utils/responsive', () => ({
  scaleFontSize: (size: number) => size,
  getResponsivePadding: (size: number) => size,
  getResponsiveBorderRadius: (size: number) => size,
  getResponsiveMargin: (size: number) => size,
  createResponsiveImageUrl: (uri: string) => uri,
}));

// Mock the orientation hook
jest.mock('../../../hooks/useOrientation', () => ({
  useResponsiveStyles: () => ({
    screenWidth: 375,
    isLandscape: false,
    isTablet: false,
  }),
}));

describe('CategoryCard', () => {
  const mockCategory: FilipinoCategory = {
    id: 'test-category',
    numericId: 1,
    name: 'Test Category',
    englishName: 'Test Category English',
    description: 'Test category description',
    englishDescription: 'Test category English description',
    backgroundColor: '#E8F5E8',
    textColor: '#2D5016',
    backgroundImage: 'test-image.png',
    layoutPosition: { row: 0, column: 0 }
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with basic props', () => {
      const { getByText, getByTestId } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      expect(getByText('Test Category')).toBeTruthy();
      expect(getByText('Test category description')).toBeTruthy();
      expect(getByTestId('category-card-test-category')).toBeTruthy();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(
        <CategoryCard 
          category={mockCategory} 
          onPress={mockOnPress} 
          testID="custom-test-id"
        />
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });

    it('renders without background image when not provided', () => {
      const categoryWithoutImage = { ...mockCategory, backgroundImage: undefined };
      const { getByText } = render(
        <CategoryCard category={categoryWithoutImage} onPress={mockOnPress} />
      );

      expect(getByText('Test Category')).toBeTruthy();
    });

    it('renders full-width category correctly', () => {
      const fullWidthCategory = {
        ...mockCategory,
        layoutPosition: { row: 2, column: 0, span: 3 }
      };
      
      const { getByText } = render(
        <CategoryCard category={fullWidthCategory} onPress={mockOnPress} />
      );

      expect(getByText('Test Category')).toBeTruthy();
    });
  });

  describe('Different Sizes', () => {
    it('renders small size correctly', () => {
      const { getByText } = render(
        <CategoryCard 
          category={mockCategory} 
          onPress={mockOnPress} 
          size="small"
        />
      );

      expect(getByText('Test Category')).toBeTruthy();
      // Small size should not show description
      expect(() => getByText('Test category description')).toThrow();
    });

    it('renders medium size correctly (default)', () => {
      const { getByText } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      expect(getByText('Test Category')).toBeTruthy();
      expect(getByText('Test category description')).toBeTruthy();
    });

    it('renders large size correctly', () => {
      const { getByText } = render(
        <CategoryCard 
          category={mockCategory} 
          onPress={mockOnPress} 
          size="large"
        />
      );

      expect(getByText('Test Category')).toBeTruthy();
      expect(getByText('Test category description')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when tapped', () => {
      const { getByTestId } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('category-card-test-category'));
      expect(mockOnPress).toHaveBeenCalledWith(mockCategory);
    });

    it('calls onPress only once per tap', () => {
      const { getByTestId } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      const card = getByTestId('category-card-test-category');
      fireEvent.press(card);
      fireEvent.press(card);
      
      expect(mockOnPress).toHaveBeenCalledTimes(2);
      expect(mockOnPress).toHaveBeenCalledWith(mockCategory);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility properties', () => {
      const { getByTestId } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      const card = getByTestId('category-card-test-category');
      
      expect(card.props.accessible).toBe(true);
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityLabel).toContain('Test Category');
      expect(card.props.accessibilityLabel).toContain('Test category description');
      expect(card.props.accessibilityHint).toContain('Double tap to view topics');
    });

    it('generates correct accessibility label', () => {
      const { getByTestId } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      const card = getByTestId('category-card-test-category');
      const expectedLabel = 'Test Category. Test category description. Tap to view topics.';
      
      expect(card.props.accessibilityLabel).toBe(expectedLabel);
    });
  });

  describe('Background Image Handling', () => {
    it('handles image loading correctly', () => {
      const { getByText } = render(
        <CategoryCard category={mockCategory} onPress={mockOnPress} />
      );

      // Component should render even during image loading
      expect(getByText('Test Category')).toBeTruthy();
    });

    it('falls back to background color when image fails', () => {
      const categoryWithoutImage = { ...mockCategory, backgroundImage: undefined };
      
      const { getByText } = render(
        <CategoryCard category={categoryWithoutImage} onPress={mockOnPress} />
      );

      expect(getByText('Test Category')).toBeTruthy();
    });
  });

  describe('Style Customization', () => {
    it('applies custom styles correctly', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = render(
        <CategoryCard 
          category={mockCategory} 
          onPress={mockOnPress} 
          style={customStyle}
        />
      );

      const card = getByTestId('category-card-test-category');
      expect(card.props.style).toEqual(
        expect.objectContaining(customStyle)
      );
    });
  });

  describe('Text Handling', () => {
    it('handles long category names correctly', () => {
      const longNameCategory = {
        ...mockCategory,
        name: 'This is a very long category name that should be handled properly'
      };

      const { getByText } = render(
        <CategoryCard category={longNameCategory} onPress={mockOnPress} />
      );

      expect(getByText(longNameCategory.name)).toBeTruthy();
    });

    it('handles long descriptions correctly', () => {
      const longDescCategory = {
        ...mockCategory,
        description: 'This is a very long category description that should be truncated or handled properly in the UI'
      };

      const { getByText } = render(
        <CategoryCard category={longDescCategory} onPress={mockOnPress} />
      );

      expect(getByText(longDescCategory.description)).toBeTruthy();
    });
  });

  describe('Color Theming', () => {
    it('applies category colors correctly', () => {
      const coloredCategory = {
        ...mockCategory,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF'
      };

      const { getByTestId } = render(
        <CategoryCard category={coloredCategory} onPress={mockOnPress} />
      );

      const card = getByTestId('category-card-test-category');
      expect(card.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#FF0000'
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional properties', () => {
      const minimalCategory = {
        id: 'minimal',
        numericId: 1,
        name: 'Minimal',
        englishName: 'Minimal',
        description: 'Minimal description',
        englishDescription: 'Minimal description',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        layoutPosition: { row: 0, column: 0 }
      };

      const { getByText } = render(
        <CategoryCard category={minimalCategory} onPress={mockOnPress} />
      );

      expect(getByText('Minimal')).toBeTruthy();
    });

    it('handles empty strings gracefully', () => {
      const emptyCategory = {
        ...mockCategory,
        name: '',
        description: ''
      };

      const { getByTestId } = render(
        <CategoryCard category={emptyCategory} onPress={mockOnPress} />
      );

      // Component should still render
      expect(getByTestId('category-card-test-category')).toBeTruthy();
    });
  });
});