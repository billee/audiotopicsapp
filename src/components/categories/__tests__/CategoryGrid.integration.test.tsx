/**
 * CategoryGrid Integration Tests
 * 
 * Integration tests that verify CategoryGrid works correctly with
 * actual category configuration and service data.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryGrid from '../CategoryGrid';
import { FILIPINO_CATEGORIES, CATEGORY_LAYOUT_CONFIG } from '../../../config/categories';
import CategoryService from '../../../services/categoryService';

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
    screenHeight: 812,
    isLandscape: false,
    isTablet: false,
  }),
}));

// Mock CategoryCard component
jest.mock('../CategoryCard', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  
  return ({ category, onPress, size, testID }: any) => (
    <TouchableOpacity 
      testID={testID}
      onPress={() => onPress(category)}
    >
      <Text testID={`${testID}-name`}>{category.name}</Text>
      <Text testID={`${testID}-size`}>{size}</Text>
    </TouchableOpacity>
  );
});

describe('CategoryGrid Integration', () => {
  const mockOnCategorySelect = jest.fn();
  const categoryService = CategoryService.getInstance();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real Data Integration', () => {
    it('renders with actual Filipino categories configuration', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
      
      // Verify all 7 Filipino categories are rendered
      expect(FILIPINO_CATEGORIES).toHaveLength(7);
      
      // Check specific categories
      expect(getByTestId('category-grid-card-pamilya-sariling-buhay')).toBeTruthy();
      expect(getByTestId('category-grid-card-araw-araw-pamumuhay')).toBeTruthy();
      expect(getByTestId('category-grid-card-balita-kasalukuyang-pangyayari')).toBeTruthy();
      expect(getByTestId('category-grid-card-damdamin-relasyon')).toBeTruthy();
      expect(getByTestId('category-grid-card-mga-plano-pagkakataon')).toBeTruthy();
      expect(getByTestId('category-grid-card-libangan-kasiyahan')).toBeTruthy();
      expect(getByTestId('category-grid-spanning-card-mga-alaala-nostalgia')).toBeTruthy();
    });

    it('uses actual layout configuration correctly', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      // Verify grid structure matches configuration
      expect(CATEGORY_LAYOUT_CONFIG.gridRows).toBe(3);
      expect(CATEGORY_LAYOUT_CONFIG.gridColumns).toBe(3);
      
      // Check that rows are rendered
      expect(getByTestId('category-grid-row-0')).toBeTruthy();
      expect(getByTestId('category-grid-row-1')).toBeTruthy();
      expect(getByTestId('category-grid-spanning-row')).toBeTruthy();
    });

    it('handles category selection with real category data', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      // Select the first category
      const firstCategory = FILIPINO_CATEGORIES[0];
      fireEvent.press(getByTestId(`category-grid-card-${firstCategory.id}`));
      
      expect(mockOnCategorySelect).toHaveBeenCalledWith(firstCategory);
      expect(mockOnCategorySelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pamilya-sariling-buhay',
          name: 'Pamilya at Sariling Buhay',
          numericId: 1,
        })
      );
    });

    it('handles spanning category selection correctly', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      // Find and select the spanning category
      const spanningCategory = FILIPINO_CATEGORIES.find(cat => cat.layoutPosition.span === 3);
      expect(spanningCategory).toBeTruthy();
      
      if (spanningCategory) {
        fireEvent.press(getByTestId(`category-grid-spanning-card-${spanningCategory.id}`));
        expect(mockOnCategorySelect).toHaveBeenCalledWith(spanningCategory);
        expect(mockOnCategorySelect).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'mga-alaala-nostalgia',
            name: 'Mga Alaala at Nostalgia',
            layoutPosition: expect.objectContaining({ span: 3 })
          })
        );
      }
    });
  });

  describe('Category Service Integration', () => {
    it('works with categories from CategoryService', () => {
      const categories = categoryService.getAllFilipinoCategories();
      const layoutConfig = categoryService.getLayoutConfig();

      const { getByTestId } = render(
        <CategoryGrid
          categories={categories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={layoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
      expect(categories).toHaveLength(7);
    });

    it('handles category layout from service correctly', () => {
      const categoriesGrid = categoryService.getCategoriesForLayout();
      const categories = categoryService.getAllFilipinoCategories();
      const layoutConfig = categoryService.getLayoutConfig();

      expect(categoriesGrid).toHaveLength(3); // 3 rows
      expect(categoriesGrid[0]).toHaveLength(3); // First row has 3 columns
      expect(categoriesGrid[1]).toHaveLength(3); // Second row has 3 columns
      expect(categoriesGrid[2]).toHaveLength(3); // Third row has 3 positions (spanning category fills all)
      
      // But the spanning category should be the same in all positions
      const spanningRow = categoriesGrid[2];
      expect(spanningRow[0]).toBe(spanningRow[1]);
      expect(spanningRow[1]).toBe(spanningRow[2]);
      expect(spanningRow[0].layoutPosition.span).toBe(3);

      const { getByTestId } = render(
        <CategoryGrid
          categories={categories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={layoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });
  });

  describe('Real Layout Positions', () => {
    it('places categories in correct positions based on layoutPosition', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      // Verify categories are in correct rows based on their layoutPosition
      const row0Categories = FILIPINO_CATEGORIES.filter(cat => cat.layoutPosition.row === 0);
      const row1Categories = FILIPINO_CATEGORIES.filter(cat => cat.layoutPosition.row === 1);
      const row2Categories = FILIPINO_CATEGORIES.filter(cat => cat.layoutPosition.row === 2);

      expect(row0Categories).toHaveLength(3);
      expect(row1Categories).toHaveLength(3);
      expect(row2Categories).toHaveLength(1);

      // Check that the spanning category is in row 2
      const spanningCategory = row2Categories[0];
      expect(spanningCategory.layoutPosition.span).toBe(3);
      expect(spanningCategory.id).toBe('mga-alaala-nostalgia');
    });

    it('renders correct card sizes based on layout', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      // Regular categories should use medium size
      const regularCategories = FILIPINO_CATEGORIES.filter(cat => !cat.layoutPosition.span || cat.layoutPosition.span === 1);
      regularCategories.forEach(category => {
        const sizeElement = getByTestId(`category-grid-card-${category.id}-size`);
        expect(sizeElement.props.children).toBe('medium');
      });

      // Spanning category should use large size
      const spanningCategory = FILIPINO_CATEGORIES.find(cat => cat.layoutPosition.span === 3);
      if (spanningCategory) {
        const sizeElement = getByTestId(`category-grid-spanning-card-${spanningCategory.id}-size`);
        expect(sizeElement.props.children).toBe('large');
      }
    });
  });

  describe('Filipino Color Scheme Integration', () => {
    it('uses Filipino color scheme from configuration', () => {
      expect(CATEGORY_LAYOUT_CONFIG.filipinoColorScheme).toBeDefined();
      expect(CATEGORY_LAYOUT_CONFIG.filipinoColorScheme.primary).toBe('#8B4513');
      expect(CATEGORY_LAYOUT_CONFIG.filipinoColorScheme.secondary).toBe('#DAA520');
      expect(CATEGORY_LAYOUT_CONFIG.filipinoColorScheme.accent).toBe('#FF6B35');
      expect(CATEGORY_LAYOUT_CONFIG.filipinoColorScheme.warm).toHaveLength(7);

      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });
  });

  describe('Category Names and Descriptions', () => {
    it('displays actual Filipino category names', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={FILIPINO_CATEGORIES}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={CATEGORY_LAYOUT_CONFIG}
        />
      );

      // Check specific Filipino names
      expect(getByTestId('category-grid-card-pamilya-sariling-buhay-name').props.children)
        .toBe('Pamilya at Sariling Buhay');
      expect(getByTestId('category-grid-card-araw-araw-pamumuhay-name').props.children)
        .toBe('Araw-araw na Pamumuhay');
      expect(getByTestId('category-grid-spanning-card-mga-alaala-nostalgia-name').props.children)
        .toBe('Mga Alaala at Nostalgia');
    });

    it('verifies all categories have proper Filipino names', () => {
      FILIPINO_CATEGORIES.forEach(category => {
        expect(category.name).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(category.englishName).toBeTruthy();
        expect(category.englishDescription).toBeTruthy();
        
        // Verify Filipino names contain Filipino words/characters
        expect(category.name).toMatch(/[a-zA-Z\s]/); // Basic check for text
        expect(category.description).toMatch(/[a-zA-Z\s]/);
      });
    });
  });
});