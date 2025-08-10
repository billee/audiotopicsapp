/**
 * CategoryCard Component - Filipino-inspired category card
 * 
 * Displays individual Filipino categories with beautiful design,
 * proper accessibility, and responsive layout support.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { FilipinoCategory } from '../../config/categories';
import { useResponsiveStyles } from '../../hooks/useOrientation';
import {
  scaleFontSize,
  getResponsivePadding,
  getResponsiveBorderRadius,
  getResponsiveMargin,
  createResponsiveImageUrl,
} from '../../utils/responsive';

export type CategoryCardSize = 'small' | 'medium' | 'large';

interface CategoryCardProps {
  category: FilipinoCategory;
  onPress: (category: FilipinoCategory) => void;
  size?: CategoryCardSize;
  style?: any;
  testID?: string;
  customHeight?: number; // Add custom height prop
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  size = 'medium',
  style,
  testID,
  customHeight
}) => {
  const { screenWidth, isLandscape, isTablet } = useResponsiveStyles();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate card dimensions based on size and layout
  const getCardDimensions = () => {
    const baseWidth = screenWidth / 3 - 16; // 3 columns with spacing
    const span = category.layoutPosition.span || 1;

    const cardWidth = span > 1 ? screenWidth - 32 : baseWidth;

    // Use custom height if provided, otherwise calculate based on size
    let cardHeight: number;
    if (customHeight) {
      cardHeight = customHeight; // Use height passed from parent
    } else {
      switch (size) {
        case 'small':
          cardHeight = isLandscape ? 80 : 100;
          break;
        case 'large':
          cardHeight = isLandscape ? 140 : 180;
          break;
        case 'medium':
        default:
          cardHeight = isLandscape ? 100 : 130;
          break;
      }

      // Adjust for spanning cards (like the bottom full-width category)
      if (span > 1) {
        cardHeight = isLandscape ? 100 : 120;
      }
    }

    return { cardWidth, cardHeight };
  };

  const { cardWidth, cardHeight } = getCardDimensions();

  const handlePress = () => {
    onPress(category);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Create responsive background image URL
  const backgroundImageUri = category.backgroundImage
    ? createResponsiveImageUrl(category.backgroundImage, cardWidth * 2, cardHeight * 2)
    : undefined;

  // Accessibility label
  const accessibilityLabel = `${category.name}. ${category.description}. Tap to view topics.`;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: category.backgroundColor,
          borderRadius: getResponsiveBorderRadius(16),
        },
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Double tap to view topics in this category"
      testID={testID || `category-card-${category.id}`}
    >
      {/* Background Image or Color Fallback */}
      {backgroundImageUri && !imageError ? (
        <ImageBackground
          source={{ uri: backgroundImageUri }}
          style={styles.backgroundImage}
          imageStyle={[
            styles.imageStyle,
            { borderRadius: getResponsiveBorderRadius(16) }
          ]}
          onError={handleImageError}
          onLoad={handleImageLoad}
          resizeMode="cover"
        >
          <View style={[
            styles.overlay,
            { backgroundColor: imageLoaded ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)' }
          ]}>
            <CardContent category={category} size={size} />
          </View>
        </ImageBackground>
      ) : (
        <View style={[
          styles.backgroundImage,
          { backgroundColor: category.backgroundColor }
        ]}>
          <CardContent category={category} size={size} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Separate component for card content to avoid duplication
const CardContent: React.FC<{
  category: FilipinoCategory;
  size: CategoryCardSize;
}> = ({ category, size }) => {
  const { isLandscape } = useResponsiveStyles();

  const getFontSizes = () => {
    switch (size) {
      case 'small':
        return {
          title: isLandscape ? 12 : 14,
          description: isLandscape ? 10 : 11,
        };
      case 'large':
        return {
          title: isLandscape ? 18 : 20,
          description: isLandscape ? 12 : 14,
        };
      case 'medium':
      default:
        return {
          title: isLandscape ? 14 : 16,
          description: isLandscape ? 11 : 12,
        };
    }
  };

  const fontSizes = getFontSizes();
  const span = category.layoutPosition.span || 1;
  const isFullWidth = span > 1;

  return (
    <View style={[
      styles.content,
      {
        padding: getResponsivePadding(isFullWidth ? 20 : 16),
        paddingTop: getResponsivePadding(isFullWidth ? 18 : 14), // Reduced top padding for text
        justifyContent: isFullWidth ? 'center' : 'flex-end',
        alignItems: isFullWidth ? 'center' : 'flex-start',
      }
    ]}>
      <Text
        style={[
          styles.categoryName,
          {
            fontSize: scaleFontSize(fontSizes.title),
            lineHeight: scaleFontSize(fontSizes.title) * 1.3,
            color: category.textColor,
            textAlign: isFullWidth ? 'center' : 'left',
            fontWeight: '700', // Bolder for Filipino aesthetic
          }
        ]}
        numberOfLines={isFullWidth ? 1 : 2}
        adjustsFontSizeToFit={isFullWidth}
        minimumFontScale={0.8}
      >
        {category.name}
      </Text>

      {size !== 'small' && (
        <Text
          style={[
            styles.categoryDescription,
            {
              fontSize: scaleFontSize(fontSizes.description),
              lineHeight: scaleFontSize(fontSizes.description) * 1.4,
              color: category.textColor,
              opacity: 0.8,
              textAlign: isFullWidth ? 'center' : 'left',
              marginTop: getResponsiveMargin(4),
            }
          ]}
          numberOfLines={isFullWidth ? 1 : 2}
        >
          {category.description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Filipino-inspired warm shadow
    ...Platform.select({
      ios: {
        shadowColor: '#8B4513', // Warm brown shadow
      },
      android: {
        elevation: 6,
      },
    }),
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    // borderRadius will be set dynamically
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
  },
  categoryName: {
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    // Filipino typography - slightly more decorative
    letterSpacing: 0.3,
  },
  categoryDescription: {
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 0.2,
  },
});

export default CategoryCard;