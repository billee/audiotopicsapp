import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { useResponsiveStyles } from '../hooks/useOrientation';
import { useBackgroundImage } from '../hooks/useBackgroundImage';
import { CategoryGrid } from '../components/category';
import { LoadingSpinner, ErrorMessage, BackgroundImage } from '../components/common';
import { Category } from '../types';
import { responsiveStyles, scaleFontSize } from '../utils/responsive';

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

  // Responsive design hooks
  const {
    isLandscape,
    isTablet,
    safeAreaPadding,
    contentPadding,
    layoutConfig,
    getResponsiveStyle,
  } = useResponsiveStyles();

  // Background image hook
  const { getBackgroundImage, preloadImages } = useBackgroundImage();

  // Handle category selection
  const handleCategorySelect = useCallback((category: Category) => {
    selectCategory(category.id);
    
    // Navigate to TopicListScreen if navigation is available
    if (navigation) {
      navigation.navigate('TopicList', { 
        category: category,
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

  // Preload background images on mount
  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  // Get the background image for category screen
  const backgroundImageUri = getBackgroundImage({ type: 'category-screen' });

  // Render loading state
  if (loading && !hasCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <BackgroundImage
          source={backgroundImageUri}
          overlay={true}
          overlayOpacity={0.6}
          overlayColors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          fallbackColor="#1a1a1a"
          testID="category-screen-background"
        >
          <LoadingSpinner message="Loading categories..." />
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !hasCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <BackgroundImage
          source={backgroundImageUri}
          overlay={true}
          overlayOpacity={0.6}
          overlayColors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          fallbackColor="#1a1a1a"
          testID="category-screen-background"
        >
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            retryText="Reload Categories"
          />
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (isEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <BackgroundImage
          source={backgroundImageUri}
          overlay={true}
          overlayOpacity={0.6}
          overlayColors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          fallbackColor="#1a1a1a"
          testID="category-screen-background"
        >
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Categories Available</Text>
            <Text style={styles.emptyMessage}>
              There are no audio topic categories available at the moment.
              Please check back later.
            </Text>
          </View>
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  // Render main content
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      <BackgroundImage
        source={backgroundImageUri}
        overlay={true}
        overlayOpacity={0.4}
        overlayColors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
        fallbackColor="#1a1a1a"
        showLoadingState={true}
        showErrorState={true}
        testID="category-screen-background"
      >
        <View style={[
          styles.header,
          getResponsiveStyle(styles.headerPortrait, styles.headerLandscape)
        ]}>
          <Text style={[
            styles.title,
            getResponsiveStyle(styles.titlePortrait, styles.titleLandscape)
          ]}>
            Audio Topics
          </Text>
          <Text style={[
            styles.subtitle,
            getResponsiveStyle(styles.subtitlePortrait, styles.subtitleLandscape)
          ]}>
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
      </BackgroundImage>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerPortrait: {
    paddingBottom: 32,
  },
  headerLandscape: {
    paddingBottom: 16,
    paddingTop: (StatusBar.currentHeight || 44) * 0.7,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titlePortrait: {
    fontSize: scaleFontSize(32),
  },
  titleLandscape: {
    fontSize: scaleFontSize(28),
  },
  subtitle: {
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitlePortrait: {
    fontSize: scaleFontSize(16),
  },
  subtitleLandscape: {
    fontSize: scaleFontSize(14),
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...responsiveStyles.container(32),
  },
  emptyTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyMessage: {
    fontSize: scaleFontSize(16),
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: scaleFontSize(16) * 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CategoryScreen;