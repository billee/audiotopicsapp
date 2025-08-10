/**
 * TopicListScreen - Displays topics for a selected category with progress indicators
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTopics } from '../hooks/useTopics';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAppSelector } from '../store/hooks';
import { selectCurrentTopic } from '../store/selectors/audioSelectors';
import { selectCategoryById } from '../store/selectors/categoriesSelectors';
import { TopicList } from '../components/topic';
import { AudioTopic } from '../types';
import { useResponsiveStyles } from '../hooks/useOrientation';
import { BackgroundImage } from '../components/common';
import { useBackgroundImage } from '../hooks/useBackgroundImage';
import { getOptimalOverlayOpacity, getCategoryColor, mapCategoryIdToName } from '../utils/backgroundImages';

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

  // Sample Filipino audio topics for testing
  const sampleTopics = [
    {
      id: '1',
      title: 'Mga Balitang Pang-ekonomiya ngayong Linggo',
      duration: 180, // 3 minutes
      audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    },
    {
      id: '2',
      title: 'Usapang Politika: Mga Nangyayari sa Senado',
      duration: 240, // 4 minutes
      audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    },
    {
      id: '3',
      title: 'Mga Pagbabago sa Lokal na Pamahalaan',
      duration: 300, // 5 minutes
      audioUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    },
  ];

  // Hooks
  const {
    topicsWithProgress,
    loading,
    error,
    stats,
    loadTopicsForCategory,
    refreshTopics,
  } = useTopics(categoryId);

  // Audio player hook
  const { loadTopic, play } = useAudioPlayer();

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

  // Handle sample topic play
  const handleSampleTopicPlay = useCallback((sampleTopic: any) => {
    // Convert sample topic to AudioTopic format
    const audioTopic: AudioTopic = {
      id: sampleTopic.id,
      title: sampleTopic.title,
      description: `Filipino audio content: ${sampleTopic.title}`,
      duration: sampleTopic.duration,
      audioUrl: sampleTopic.audioUrl,
      categoryId: categoryId,
      tags: ['filipino', 'news'],
      difficulty: 'beginner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleTopicPress(audioTopic);
  }, [handleTopicPress, categoryId]);

  // Background image hook
  const { getBackgroundImage } = useBackgroundImage();

  // Get contextual background image for this category
  console.log('TopicListScreen categoryId:', categoryId);

  // TEMPORARY FIX: Force science category to use solid color background
  let backgroundImageUrl;
  if (categoryId === '2') {
    console.log('Science category detected, using solid color background');
    backgroundImageUrl = null; // This will force fallback color
  } else {
    backgroundImageUrl = getBackgroundImage({
      type: 'topic-list',
      categoryId: categoryId, // Use the numeric ID, mapping will be handled internally
    });
  }
  console.log('TopicListScreen backgroundImageUrl:', backgroundImageUrl);

  // Get optimal overlay opacity for topic list readability
  const overlayOpacity = getOptimalOverlayOpacity({ type: 'topic-list', categoryId });

  // Fallback color based on category
  let fallbackColor = getCategoryColor(categoryId);

  // Enhanced fallback color for science category
  if (categoryId === '2') {
    fallbackColor = '#065f46'; // A nice science-themed green color
    console.log('Using enhanced science fallback color:', fallbackColor);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={category?.color || '#007AFF'}
      />

      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: category?.color || '#007AFF' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={26} color="#FFFFFF" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category?.name || route.params.categoryName || 'Topics'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <BackgroundImage
        source={backgroundImageUrl}
        overlay={true}
        overlayOpacity={categoryId === '2' ? 0.3 : overlayOpacity} // Lighter overlay for solid color
        overlayColors={categoryId === '2' ?
          ['rgba(6,95,70,0.1)', 'rgba(6,95,70,0.3)'] : // Science-themed gradient
          ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']
        }
        fallbackColor={fallbackColor}
        showLoadingState={false}
        showErrorState={false}
        enableResponsiveImages={false}
        resizeMode="stretch"
        testID="topic-list-background"
      >
        <View style={styles.topicsContainer}>
          {sampleTopics.map((topic, index) => (
            <View key={topic.id} style={styles.topicRow}>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDuration}>{Math.floor(topic.duration / 60)}:{(topic.duration % 60).toString().padStart(2, '0')}</Text>
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handleSampleTopicPlay(topic)}
              >
                <Icon name="play-arrow" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </BackgroundImage>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent background for better visibility
  },
  backIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSpacer: {
    width: 40,
  },
  topicsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicInfo: {
    flex: 1,
    marginRight: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  topicDuration: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default TopicListScreen;