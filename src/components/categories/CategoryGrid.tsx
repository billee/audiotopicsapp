/**
 * CategoryGrid Component - Filipino-inspired category grid layout
 * 
 * Implements a 3x3 grid layout with the bottom category spanning full width.
 * All 7 Filipino categories are visible without scrolling on mobile screens.
 * Features smooth animations and responsive design.
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { FilipinoCategory, CategoryLayoutConfig } from '../../config/categories';
import { useResponsiveStyles } from '../../hooks/useOrientation';
import { 
  getResponsivePadding, 
  getResponsiveMargin,
  scaleFontSize,
} from '../../utils/responsive';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: FilipinoCategory[];
  onCategorySelect: (category: FilipinoCategory) => void;
  layoutConfig: CategoryLayoutConfig;
  testID?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategorySelect,
  layoutConfig,
  testID = 'category-grid'
}) => {
  const { screenWidth, screenHeight, isLandscape, isTablet } = useResponsiveStyles();

  // Calculate grid dimensions to fit all categories without scrolling
  const gridDimensions = useMemo(() => {
    const availableWidth = screenWidth - (getResponsivePadding(16) * 2);
    const availableHeight = screenHeight - 200; // Reserve space for header/navigation
    
    const spacing = layoutConfig.cardSpacing;
    
    // Calculate card dimensions for 3x3 grid with bottom spanning
    const cardWidth = (availableWidth - (spacing * 2)) / 3;
    
    // Calculate heights to fit in available space
    // Top 2 rows: regular cards, Bottom row: spanning card
    const regularCardHeight = Math.min(
      cardWidth * (isLandscape ? 0.8 : 1.0), // Aspect ratio adjustment
      (availableHeight - (spacing * 2)) / 3 // Ensure it fits in 1/3 of available height
    );
    
    const spanningCardHeight = Math.min(
      regularCardHeight * 0.8, // Slightly shorter for better proportion
      availableHeight - (regularCardHeight * 2) - (spacing * 2)
    );

    return {
      cardWidth,
      regularCardHeight,
      spanningCardHeight,
      spacing,
      availableWidth,
      availableHeight,
    };
  }, [screenWidth, screenHeight, isLandscape, layoutConfig.cardSpacing]);

  // Organize categories by their layout positions
  const organizedCategories = useMemo(() => {
    const grid: (FilipinoCategory | null)[][] = [
      [null, null, null], // Row 0
      [null, null, null], // Row 1
      [null]              // Row 2 (spanning category)
    ];

    categories.forEach(category => {
      const { row, column, span = 1 } = category.layoutPosition;
      if (row < grid.length && column < grid[row].length) {
        grid[row][column] = category;
      }
    });

    return grid;
  }, [categories]);

  const handleCategoryPress = (category: FilipinoCategory) => {
    // Add subtle haptic feedback if available
    try {
      // This would be implemented with react-native-haptic-feedback if available
      // HapticFeedback.trigger('impactLight');
    } catch (error) {
      // Haptic feedback not available, continue silently
    }
    
    onCategorySelect(category);
  };

  const renderRegularRow = (rowCategories: (FilipinoCategory | null)[], rowIndex: number) => {
    return (
      <View key={`row-${rowIndex}`} style={styles.row} testID={`${testID}-row-${rowIndex}`}>
        {rowCategories.map((category, columnIndex) => {
          if (!category) return null;
          
          return (
            <View
              key={category.id}
              style={[
                styles.cardContainer,
                {
                  width: gridDimensions.cardWidth,
                  height: gridDimensions.regularCardHeight,
                  marginRight: columnIndex < rowCategories.length - 1 ? gridDimensions.spacing : 0,
                }
              ]}
            >
              <CategoryCard
                category={category}
                onPress={handleCategoryPress}
                size="medium"
                testID={`${testID}-card-${category.id}`}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const renderSpanningRow = (category: FilipinoCategory | null) => {
    if (!category) return null;

    return (
      <View key="spanning-row" style={styles.spanningRow} testID={`${testID}-spanning-row`}>
        <View
          style={[
            styles.spanningCardContainer,
            {
              width: gridDimensions.availableWidth,
              height: gridDimensions.spanningCardHeight,
            }
          ]}
        >
          <CategoryCard
            category={category}
            onPress={handleCategoryPress}
            size="large"
            testID={`${testID}-spanning-card-${category.id}`}
          />
        </View>
      </View>
    );
  };

  return (
    <View 
      style={[
        styles.container,
        {
          paddingHorizontal: getResponsivePadding(16),
          paddingVertical: getResponsiveMargin(12),
        }
      ]}
      testID={testID}
    >
      {/* Regular rows (0 and 1) */}
      {organizedCategories.slice(0, 2).map((rowCategories, rowIndex) => 
        renderRegularRow(rowCategories, rowIndex)
      )}
      
      {/* Spacing between regular rows and spanning row */}
      <View style={{ height: gridDimensions.spacing }} />
      
      {/* Spanning row (row 2) */}
      {organizedCategories[2] && renderSpanningRow(organizedCategories[2][0])}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveMargin(12),
  },
  spanningRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spanningCardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryGrid;