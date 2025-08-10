import React, { useCallback, useEffect, useState } from 'react';
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
import { CategoryGrid } from '../components/categories';
import { LoadingSpinner, ErrorMessage, BackgroundImage } from '../components/common';
import { Category } from '../types';
import { FilipinoCategory } from '../config/categories';
import { CategoryService } from '../services';
import { responsiveStyles, scaleFontSize } from '../utils/responsive';

interface CategoryScreenProps {
  navigation?: any; // Navigation prop for React Navigation
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation }) => {
  // Filipino categories state
  const [filipinoCategories, setFilipinoCategories] = useState<FilipinoCategory[]>([]);
  const [layoutConfig, setLayoutConfig] = useState(CategoryService.getInstance().getLayoutConfig());
  const [filipinoLoading, setFilipinoLoading] = useState(true);
  const [filipinoError, setFilipinoError] = useState<string | null>(null);

  // Legacy categories hook for backward compatibility
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
    getResponsiveStyle,
  } = useResponsiveStyles();

  // Background image hook
  const { getBackgroundImage, preloadImages } = useBackgroundImage();

  // Load Filipino categories
  const loadFilipinoCategories = useCallback(async () => {
    try {
      setFilipinoLoading(true);
      setFilipinoError(null);

      const categoryService = CategoryService.getInstance();
      const categories = categoryService.getAllFilipinoCategories();
      const config = categoryService.getLayoutConfig();

      // Simulate network delay for consistency with legacy behavior
      await new Promise(resolve => setTimeout(resolve, 300));

      setFilipinoCategories(categories);
      setLayoutConfig(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setFilipinoError(errorMessage);
      console.error('Error loading Filipino categories:', err);
    } finally {
      setFilipinoLoading(false);
    }
  }, []);

  // Handle Filipino category selection
  const handleFilipinoSelect = useCallback((category: FilipinoCategory) => {
    // Update legacy selected category for backward compatibility
    selectCategory(category.id);

    // Navigate to TopicListScreen if navigation is available
    if (navigation) {
      // Convert Filipino category to legacy format for navigation
      const legacyCategory: Category = {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.backgroundColor,
        topicCount: 0, // This would be calculated based on actual topics
        iconUrl: category.icon,
        backgroundImageUrl: category.backgroundImage
      };

      navigation.navigate('TopicList', {
        category: legacyCategory,
        categoryId: category.id,
        categoryName: category.name
      });
    }
  }, [selectCategory, navigation]);

  // Handle category selection (legacy support)
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
    setFilipinoError(null);
    loadFilipinoCategories();
    // Also retry legacy categories for backward compatibility
    clearError();
    loadCategories();
  }, [loadFilipinoCategories, clearError, loadCategories]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadFilipinoCategories();
    // Also refresh legacy categories for backward compatibility
    refreshCategories();
  }, [loadFilipinoCategories, refreshCategories]);

  // Auto-load Filipino categories on mount
  useEffect(() => {
    loadFilipinoCategories();
  }, [loadFilipinoCategories]);

  // Auto-load legacy categories on mount (for backward compatibility)
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
  if (filipinoLoading && filipinoCategories.length === 0) {
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
          <LoadingSpinner message="Loading Filipino categories..." />
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  // Render error state
  if (filipinoError && filipinoCategories.length === 0) {
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
            message={filipinoError}
            onRetry={handleRetry}
            retryText="Reload Categories"
          />
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (filipinoCategories.length === 0 && !filipinoLoading) {
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
            <Text style={styles.emptyTitle}>Walang Available na Categories</Text>
            <Text style={styles.emptyMessage}>
              Walang mga audio topic categories na available sa ngayon.
              Subukan ulit mamaya.
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
            Ka Pinoy AI Audios
          </Text>
          <Text style={[
            styles.subtitle,
            getResponsiveStyle(styles.subtitlePortrait, styles.subtitleLandscape)
          ]}>
            Tuklasin ang {filipinoCategories.length} kategorya ng mga nakaaantig na audio content
          </Text>
        </View>

        <View style={styles.content}>
          <CategoryGrid
            categories={filipinoCategories}
            onCategorySelect={handleFilipinoSelect}
            layoutConfig={layoutConfig}
            testID="filipino-category-grid"
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