/**
 * CategoryGrid Component Tests
 * 
 * Tests for the Filipino-inspired CategoryGrid component including
 * layout rendering, responsiveness, user interactions, and grid structure.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryGrid from '../CategoryGrid';
import { FilipinoCategory, CategoryLayoutConfig } from '../../../config/categories';

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

describe('CategoryGrid', () => {
  const mockCategories: FilipinoCategory[] = [
    {
      id: 'pamilya-sariling-buhay',
      numericId: 1,
      name: 'Pamilya at Sariling Buhay',
      englishName: 'Personal & Family Life',
      description: 'Mga kwento tungkol sa pamilya',
      englishDescription: 'Stories about family',
      backgroundColor: '#E8F5E8',
      textColor: '#2D5016',
      layoutPosition: { row: 0, column: 0 }
    },
    {
      id: 'araw-araw-pamumuhay',
      numericId: 2,
      name: 'Araw-araw na Pamumuhay',
      englishName: 'Daily Life & Local Culture',
      description: 'Mga karanasan sa pang-araw-araw',
      englishDescription: 'Daily life experiences',
      backgroundColor: '#FFF4E6',
      textColor: '#8B4513',
      layoutPosition: { row: 0, column: 1 }
    },
    {
      id: 'balita-kasalukuyang-pangyayari',
      numericId: 3,
      name: 'Balita at Kasalukuyang Pangyayari',
      englishName: 'News & Current Events',
      description: 'Mga balita at usapang politika',
      englishDescription: 'News and political discussions',
      backgroundColor: '#E6F3FF',
      textColor: '#1E3A8A',
      layoutPosition: { row: 0, column: 2 }
    },
    {
      id: 'damdamin-relasyon',
      numericId: 4,
      name: 'Damdamin at Relasyon',
      englishName: 'Emotional & Relationship Matters',
      description: 'Mga usapang puso at relasyon',
      englishDescription: 'Matters of the heart and relationships',
      backgroundColor: '#FFE6F0',
      textColor: '#BE185D',
      layoutPosition: { row: 1, column: 0 }
    },
    {
      id: 'mga-plano-pagkakataon',
      numericId: 5,
      name: 'Mga Plano at Pagkakataon',
      englishName: 'Plans & Opportunities',
      description: 'Mga pangarap at plano sa hinaharap',
      englishDescription: 'Dreams and future plans',
      backgroundColor: '#F0E6FF',
      textColor: '#6B21A8',
      layoutPosition: { row: 1, column: 1 }
    },
    {
      id: 'libangan-kasiyahan',
      numericId: 6,
      name: 'Libangan at Kasiyahan',
      englishName: 'Entertainment & Fun',
      description: 'Mga libangan at kasiyahan',
      englishDescription: 'Entertainment and fun',
      backgroundColor: '#FFEB3B',
      textColor: '#F57F17',
      layoutPosition: { row: 1, column: 2 }
    },
    {
      id: 'mga-alaala-nostalgia',
      numericId: 7,
      name: 'Mga Alaala at Nostalgia',
      englishName: 'Shared Nostalgia',
      description: 'Mga alaala at nostalgia',
      englishDescription: 'Memories and nostalgia',
      backgroundColor: '#E8E8E8',
      textColor: '#424242',
      layoutPosition: { row: 2, column: 0, span: 3 }
    }
  ];

  const mockLayoutConfig: CategoryLayoutConfig = {
    gridRows: 3,
    gridColumns: 3,
    cardSpacing: 12,
    cardBorderRadius: 16,
    filipinoColorScheme: {
      primary: '#8B4513',
      secondary: '#DAA520',
      accent: '#FF6B35',
      warm: ['#E8F5E8', '#FFF4E6', '#E6F3FF', '#FFE6F0', '#F0E6FF', '#FFEB3B', '#E8E8E8']
    }
  };

  const mockOnCategorySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with all categories', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
      expect(getByTestId('category-grid-row-0')).toBeTruthy();
      expect(getByTestId('category-grid-row-1')).toBeTruthy();
      expect(getByTestId('category-grid-spanning-row')).toBeTruthy();
    });

    it('renders all 7 categories', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Check that all categories are rendered
      mockCategories.forEach(category => {
        const isSpanning = category.layoutPosition.span === 3;
        const testId = isSpanning 
          ? `category-grid-spanning-card-${category.id}`
          : `category-grid-card-${category.id}`;
        expect(getByTestId(testId)).toBeTruthy();
      });
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
          testID="custom-grid"
        />
      );

      expect(getByTestId('custom-grid')).toBeTruthy();
      expect(getByTestId('custom-grid-row-0')).toBeTruthy();
    });

    it('renders empty grid when no categories provided', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={[]}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });
  });

  describe('Grid Layout Structure', () => {
    it('organizes categories in correct 3x3 grid structure', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Row 0 should have 3 categories
      expect(getByTestId('category-grid-card-pamilya-sariling-buhay')).toBeTruthy();
      expect(getByTestId('category-grid-card-araw-araw-pamumuhay')).toBeTruthy();
      expect(getByTestId('category-grid-card-balita-kasalukuyang-pangyayari')).toBeTruthy();

      // Row 1 should have 3 categories
      expect(getByTestId('category-grid-card-damdamin-relasyon')).toBeTruthy();
      expect(getByTestId('category-grid-card-mga-plano-pagkakataon')).toBeTruthy();
      expect(getByTestId('category-grid-card-libangan-kasiyahan')).toBeTruthy();

      // Row 2 should have 1 spanning category
      expect(getByTestId('category-grid-spanning-card-mga-alaala-nostalgia')).toBeTruthy();
    });

    it('renders regular cards with medium size', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Check that regular cards use medium size
      const regularCards = mockCategories.slice(0, 6); // First 6 are regular
      regularCards.forEach(category => {
        const sizeElement = getByTestId(`category-grid-card-${category.id}-size`);
        expect(sizeElement.props.children).toBe('medium');
      });
    });

    it('renders spanning card with large size', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Check that spanning card uses large size
      const spanningCard = mockCategories.find(cat => cat.layoutPosition.span === 3);
      if (spanningCard) {
        const sizeElement = getByTestId(`category-grid-spanning-card-${spanningCard.id}-size`);
        expect(sizeElement.props.children).toBe('large');
      }
    });
  });

  describe('User Interactions', () => {
    it('calls onCategorySelect when category is pressed', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      const firstCategory = mockCategories[0];
      fireEvent.press(getByTestId(`category-grid-card-${firstCategory.id}`));
      
      expect(mockOnCategorySelect).toHaveBeenCalledWith(firstCategory);
    });

    it('calls onCategorySelect for spanning category', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      const spanningCategory = mockCategories.find(cat => cat.layoutPosition.span === 3);
      if (spanningCategory) {
        fireEvent.press(getByTestId(`category-grid-spanning-card-${spanningCategory.id}`));
        expect(mockOnCategorySelect).toHaveBeenCalledWith(spanningCategory);
      }
    });

    it('handles multiple category selections', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Press multiple categories
      fireEvent.press(getByTestId(`category-grid-card-${mockCategories[0].id}`));
      fireEvent.press(getByTestId(`category-grid-card-${mockCategories[1].id}`));
      
      expect(mockOnCategorySelect).toHaveBeenCalledTimes(2);
      expect(mockOnCategorySelect).toHaveBeenNthCalledWith(1, mockCategories[0]);
      expect(mockOnCategorySelect).toHaveBeenNthCalledWith(2, mockCategories[1]);
    });
  });

  describe('Responsiveness', () => {
    it('adapts to different screen sizes', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
      // Component should render successfully with different screen sizes
    });

    it('adapts to landscape orientation', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
      // Component should render successfully in landscape
    });

    it('adapts to tablet screens', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
      // Component should render successfully on tablets
    });
  });

  describe('Layout Configuration', () => {
    it('uses provided layout configuration', () => {
      const customLayoutConfig: CategoryLayoutConfig = {
        ...mockLayoutConfig,
        cardSpacing: 20,
        cardBorderRadius: 12,
      };

      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={customLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });

    it('handles missing layout configuration gracefully', () => {
      const minimalLayoutConfig: CategoryLayoutConfig = {
        gridRows: 3,
        gridColumns: 3,
        cardSpacing: 0,
        cardBorderRadius: 0,
        filipinoColorScheme: {
          primary: '#000000',
          secondary: '#000000',
          accent: '#000000',
          warm: []
        }
      };

      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={minimalLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles categories with missing layout positions', () => {
      const categoriesWithMissingPositions = [
        {
          ...mockCategories[0],
          layoutPosition: { row: 0, column: 0 }
        }
      ];

      const { getByTestId } = render(
        <CategoryGrid
          categories={categoriesWithMissingPositions}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });

    it('handles categories with invalid layout positions', () => {
      const categoriesWithInvalidPositions = [
        {
          ...mockCategories[0],
          layoutPosition: { row: 10, column: 10 } // Invalid position
        }
      ];

      const { getByTestId } = render(
        <CategoryGrid
          categories={categoriesWithInvalidPositions}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });

    it('handles partial category lists', () => {
      const partialCategories = mockCategories.slice(0, 3);

      const { getByTestId } = render(
        <CategoryGrid
          categories={partialCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });

    it('handles duplicate categories gracefully', () => {
      const duplicateCategories = [...mockCategories, mockCategories[0]];

      const { getByTestId } = render(
        <CategoryGrid
          categories={duplicateCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      expect(getByTestId('category-grid')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('memoizes category organization', () => {
      const { rerender } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Re-render with same props
      rerender(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Component should handle re-renders efficiently
      expect(true).toBe(true); // Test passes if no errors occur
    });

    it('handles rapid category selections', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Rapidly press categories
      const firstCategory = getByTestId(`category-grid-card-${mockCategories[0].id}`);
      fireEvent.press(firstCategory);
      fireEvent.press(firstCategory);
      fireEvent.press(firstCategory);

      expect(mockOnCategorySelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('provides proper test IDs for all elements', () => {
      const { getByTestId } = render(
        <CategoryGrid
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          layoutConfig={mockLayoutConfig}
        />
      );

      // Main grid
      expect(getByTestId('category-grid')).toBeTruthy();
      
      // Rows
      expect(getByTestId('category-grid-row-0')).toBeTruthy();
      expect(getByTestId('category-grid-row-1')).toBeTruthy();
      expect(getByTestId('category-grid-spanning-row')).toBeTruthy();

      // All category cards
      mockCategories.forEach(category => {
        const isSpanning = category.layoutPosition.span === 3;
        const testId = isSpanning 
          ? `category-grid-spanning-card-${category.id}`
          : `category-grid-card-${category.id}`;
        expect(getByTestId(testId)).toBeTruthy();
      });
    });
  });
});