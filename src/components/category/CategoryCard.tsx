import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Category } from '../../types';
import { useLayoutConfig, useResponsiveStyles } from '../../hooks/useOrientation';
import { 
  scaleFontSize, 
  getResponsivePadding, 
  getResponsiveBorderRadius,
  getResponsiveMargin 
} from '../../utils/responsive';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const { categoryGrid } = useLayoutConfig();
  const { screenWidth, isLandscape } = useResponsiveStyles();
  
  // Calculate responsive card width based on columns and screen width
  const cardMargin = getResponsivePadding(16);
  const cardSpacing = getResponsiveMargin(8);
  const totalMargin = cardMargin * 2 + cardSpacing * (categoryGrid.columns - 1);
  const cardWidth = (screenWidth - totalMargin) / categoryGrid.columns;
  
  // Calculate responsive height based on aspect ratio
  const cardHeight = cardWidth / categoryGrid.itemAspectRatio;

  const handlePress = () => {
    onPress(category);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight,
          marginBottom: getResponsiveMargin(16),
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: category.backgroundImageUrl }}
        style={styles.backgroundImage}
        imageStyle={[styles.imageStyle, { borderRadius: getResponsiveBorderRadius(12) }]}
      >
        <View style={styles.overlay}>
          <View style={[styles.content, { padding: getResponsivePadding(12) }]}>
            <Text style={[
              styles.categoryName,
              { 
                fontSize: scaleFontSize(isLandscape ? 14 : 16),
                lineHeight: scaleFontSize(isLandscape ? 14 : 16) * 1.25,
              }
            ]} numberOfLines={2}>
              {category.name}
            </Text>
            <Text style={[
              styles.topicCount,
              { fontSize: scaleFontSize(isLandscape ? 10 : 12) }
            ]}>
              {category.topicCount} topic{category.topicCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: getResponsiveBorderRadius(12),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    // padding will be set dynamically
  },
  categoryName: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  topicCount: {
    color: '#E0E0E0',
    fontWeight: '400',
  },
});

export default CategoryCard;