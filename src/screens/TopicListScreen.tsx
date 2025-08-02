/**
 * TopicListScreen - Displays topics for a selected category with progress indicators
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useTopics } from '../hooks/useTopics';
import { useAppSelector } from '../store/hooks';
import { selectCurrentTopic } from '../store/selectors/audioSelectors';
import { selectCategoryById } from '../store/selectors/categoriesSelectors';
import { TopicList } from '../components/topic';
import { AudioTopic } from '../types';
import { useResponsiveStyles } from '../hooks/useOrientation';

// Props interface for simplified navigation
interface TopicListScreenProps {
  route: {
    params: {
      categoryId: string;
      categoryName?: string;
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const TopicListScreen: React.FC<TopicListScreenProps> = ({ route, navigation }) => {
  const { categoryId } = route.params;

  // Hooks
  const {
    topicsWithProgress,
    loading,
    error,
    stats,
    loadTopicsForCategory,
    refreshTopics,
  } = useTopics(categoryId);

  // Responsive design
  const { isLandscape, isTablet } = useResponsiveStyles();

  // Selectors
  const currentTopic = useAppSelector(selectCurrentTopic);
  const category = useAppSelector(state => selectCategoryById(state, categoryId));

  // Load topics when component mounts or categoryId changes
  useEffect(() => {
    if (categoryId) {
      loadTopicsForCategory(categoryId);
    }
  }, [categoryId, loadTopicsForCategory]);

  // Set navigation title (disabled for simplified navigation)
  // useEffect(() => {
  //   if (category) {
  //     navigation.setOptions({
  //       title: category.name,
  //       headerStyle: {
  //         backgroundColor: category.color || '#007AFF',
  //       },
  //       headerTintColor: '#FFFFFF',
  //       headerTitleStyle: {
  //         fontWeight: '600',
  //       },
  //     });
  //   }
  // }, [navigation, category]);

  // Handle topic selection
  const handleTopicPress = useCallback(
    (topic: AudioTopic) => {
      navigation.navigate('AudioPlayer', { topic });
    },
    [navigation]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshTopics();
  }, [refreshTopics]);

  const backgroundImageUrl = category?.backgroundImageUrl;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={category?.color || '#007AFF'}
      />
      
      {backgroundImageUrl ? (
        <ImageBackground
          source={{ uri: backgroundImageUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <TopicList
              topics={topicsWithProgress}
              loading={loading}
              error={error}
              currentPlayingTopicId={currentTopic?.id}
              onTopicPress={handleTopicPress}
              onRefresh={handleRefresh}
              emptyMessage={`No topics available in ${category?.name || 'this category'}`}
              showStats={true}
              stats={stats}
            />
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.container}>
          <TopicList
            topics={topicsWithProgress}
            loading={loading}
            error={error}
            currentPlayingTopicId={currentTopic?.id}
            onTopicPress={handleTopicPress}
            onRefresh={handleRefresh}
            emptyMessage={`No topics available in ${category?.name || 'this category'}`}
            showStats={true}
            stats={stats}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default TopicListScreen;