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

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margins

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const handlePress = () => {
    onPress(category);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: category.backgroundImageUrl }}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.categoryName} numberOfLines={2}>
              {category.name}
            </Text>
            <Text style={styles.topicCount}>
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
    width: CARD_WIDTH,
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
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
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  topicCount: {
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: '400',
  },
});

export default CategoryCard;