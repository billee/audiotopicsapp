import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { CategoryGrid } from '../components/category';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { Category } from '../types';

interface CategoryScreenProps {
  navigation?: any; // Navigation prop for React Navigation
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation }) => {
  const {
    categories,
    loading,
    error,
    loadCategories,
    refreshCategories,
    selectCategory,
    clearError,
    hasCategories,
    isEmpty,
  } = useCategories();

  // Handle category selection
  const handleCategorySelect = useCallback((category: Category) => {
    selectCategory(category.id);
    
    // Navigate to TopicListScreen if navigation is available
    if (navigation) {
      navigation.navigate('TopicList', { 
        categoryId: category.id,
        categoryName: category.name 
      });
    }
  }, [selectCategory, navigation]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    clearError();
    loadCategories();
  }, [clearError, loadCategories]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    refreshCategories();
  }, [refreshCategories]);

  // Auto-load categories on mount
  useEffect(() => {
    if (!hasCategories && !loading && !error) {
      loadCategories();
    }
  }, [hasCategories, loading, error, loadCategories]);

  // Render loading state
  if (loading && !hasCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://via.placeholder.com/400x800/1a1a1a/FFFFFF?text=Audio+Topics' }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay}>
            <LoadingSpinner message="Loading categories..." />
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !hasCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://via.placeholder.com/400x800/1a1a1a/FFFFFF?text=Audio+Topics' }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay}>
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
              retryText="Reload Categories"
            />
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (isEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://via.placeholder.com/400x800/1a1a1a/FFFFFF?text=Audio+Topics' }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay}>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Categories Available</Text>
              <Text style={styles.emptyMessage}>
                There are no audio topic categories available at the moment.
                Please check back later.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Render main content
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      <ImageBackground
        source={{ uri: 'https://via.placeholder.com/400x800/1a1a1a/FFFFFF?text=Audio+Topics' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Audio Topics</Text>
            <Text style={styles.subtitle}>
              Discover {categories.length} categories of engaging audio content
            </Text>
          </View>
          
          <View style={styles.content}>
            <CategoryGrid
              categories={categories}
              onCategorySelect={handleCategorySelect}
              refreshing={loading}
              onRefresh={handleRefresh}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CategoryScreen;