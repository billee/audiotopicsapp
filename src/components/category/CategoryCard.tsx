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
  
  // Set fixed dimensions to match the widest box (Technology)
  const cardWidth = isLandscape ? 200 : 180;
  const cardHeight = isLandscape ? 120 : 150;

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
          minWidth: cardWidth,
          maxWidth: cardWidth,
          minHeight: cardHeight,
          maxHeight: cardHeight,
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
          <View style={styles.content}>
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
    flexShrink: 0,
    flexGrow: 0,
    flex: 0,
    position: 'relative',
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
    padding: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  categoryName: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    width: '100%',
    textAlign: 'left',
  },
  topicCount: {
    color: '#E0E0E0',
    fontWeight: '400',
    width: '100%',
    textAlign: 'left',
  },
});

export default CategoryCard;