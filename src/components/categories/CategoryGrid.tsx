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

    // Calculate card dimensions for full-width layout (one per row)
    const cardWidth = availableWidth; // Full width for each card

    // Calculate heights for full-width layout
    // We have 7 categories, so we need 6 gaps between them
    const totalSpacingHeight = spacing * 6; // 6 gaps between 7 rows
    const availableCardHeight = availableHeight - totalSpacingHeight;

    // Each card gets equal height, optimized for text display
    const regularCardHeight = Math.min(
      isLandscape ? 80 : 100, // Fixed height optimized for text
      availableCardHeight / 7 // Divide by 7 for all categories
    );

    const spanningCardHeight = regularCardHeight; // Same height for all cards

    return {
      cardWidth,
      regularCardHeight,
      spanningCardHeight,
      spacing,
      availableWidth,
      availableHeight,
    };
  }, [screenWidth, screenHeight, isLandscape, layoutConfig.cardSpacing]);

  // Organize categories - one per row (full width)
  const organizedCategories = useMemo(() => {
    // Simply return each category as its own row
    return categories.map(category => [category]);
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
    // Make first row taller than second row
    const rowHeight = rowIndex === 0
      ? gridDimensions.regularCardHeight * 1.3 // First row 30% taller
      : gridDimensions.regularCardHeight; // Second row normal height

    return (
      <View
        key={`row-${rowIndex}`}
        style={styles.row}
        testID={`${testID}-row-${rowIndex}`}
      >
        {rowCategories.map((category, columnIndex) => {
          if (!category) return null;

          return (
            <View
              key={category.id}
              style={[
                styles.cardContainer,
                {
                  width: gridDimensions.cardWidth,
                  height: rowHeight, // Use dynamic height based on row
                }
              ]}
            >
              <CategoryCard
                category={category}
                onPress={handleCategoryPress}
                size="medium"
                customHeight={rowHeight} // Pass the dynamic height
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
      {/* All 7 categories as full-width rows */}
      {organizedCategories.map((rowCategories, rowIndex) =>
        renderRegularRow(rowCategories, rowIndex)
      )}
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
    justifyContent: 'center', // Center the full-width card
    alignItems: 'center',
    marginBottom: 16, // Spacing between full-width rows
    paddingHorizontal: 8,
  },
  spanningRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, // Add top margin for separation from regular rows
    marginBottom: 16, // Add bottom margin
    paddingHorizontal: 8, // Add horizontal padding
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4, // Add margin around each card
    flex: 1, // Allow cards to expand equally
  },
  spanningCardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4, // Add margin around spanning card
  },
});

export default CategoryGrid;