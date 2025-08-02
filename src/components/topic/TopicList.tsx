/**
 * TopicList component - Efficient list rendering for topics
 */

import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { AudioTopic, ProgressData } from '../../types';
import TopicCard from './TopicCard';
import { LoadingSpinner, ErrorMessage } from '../common';
import { useLayoutConfig, useResponsiveStyles } from '../../hooks/useOrientation';
import { 
  scaleFontSize, 
  getResponsivePadding, 
  getResponsiveBorderRadius,
  getResponsiveMargin 
} from '../../utils/responsive';

interface TopicWithProgress extends AudioTopic {
  progress?: ProgressData | null;
  isCompleted: boolean;
  isInProgress: boolean;
  progressPercentage: number;
}

interface TopicListProps {
  topics: TopicWithProgress[];
  loading: boolean;
  error: string | null;
  currentPlayingTopicId?: string | null;
  onTopicPress: (topic: AudioTopic) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
  showStats?: boolean;
  stats?: {
    totalTopics: number;
    completedCount: number;
    inProgressCount: number;
    notStartedCount: number;
    completionPercentage: number;
  };
}

const TopicList: React.FC<TopicListProps> = ({
  topics,
  loading,
  error,
  currentPlayingTopicId,
  onTopicPress,
  onRefresh,
  emptyMessage = 'No topics available',
  showStats = false,
  stats,
}) => {
  const { topicList } = useLayoutConfig();
  const { isLandscape, isTablet } = useResponsiveStyles();
  const renderTopic: ListRenderItem<TopicWithProgress> = useCallback(
    ({ item }) => (
      <TopicCard
        topic={item}
        progress={item.progress}
        onPress={onTopicPress}
        isPlaying={currentPlayingTopicId === item.id}
      />
    ),
    [onTopicPress, currentPlayingTopicId]
  );

  const renderHeader = useCallback(() => {
    if (!showStats || !stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Progress Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalTopics}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.completedNumber]}>
              {stats.completedCount}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.inProgressNumber]}>
              {stats.inProgressCount}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.notStartedCount}</Text>
            <Text style={styles.statLabel}>Not Started</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${stats.completionPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(stats.completionPercentage)}% Complete
          </Text>
        </View>
      </View>
    );
  }, [showStats, stats]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [loading, emptyMessage]);

  const keyExtractor = useCallback(
    (item: TopicWithProgress) => item.id,
    []
  );

  const getItemLayout = useCallback(
    (data: ArrayLike<TopicWithProgress> | null | undefined, index: number) => ({
      length: topicList.itemHeight, // Responsive height of TopicCard
      offset: topicList.itemHeight * index,
      index,
    }),
    [topicList.itemHeight]
  );

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={onRefresh}
      />
    );
  }

  if (loading && topics.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={topics}
      renderItem={renderTopic}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        ) : undefined
      }
      contentContainerStyle={[
        styles.container,
        topics.length === 0 && styles.emptyListContainer,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: getResponsivePadding(8),
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statsContainer: {
    backgroundColor: '#F8F9FA',
    margin: getResponsiveMargin(16),
    padding: getResponsivePadding(16),
    borderRadius: getResponsiveBorderRadius(12),
    marginBottom: getResponsiveMargin(8),
  },
  statsTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: getResponsiveMargin(12),
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: getResponsiveMargin(16),
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: getResponsiveMargin(4),
  },
  completedNumber: {
    color: '#34C759',
  },
  inProgressNumber: {
    color: '#FF9500',
  },
  statLabel: {
    fontSize: scaleFontSize(12),
    color: '#6C6C70',
    textAlign: 'center',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: getResponsiveMargin(8),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    color: '#34C759',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(32),
  },
  emptyText: {
    fontSize: scaleFontSize(16),
    color: '#6C6C70',
    textAlign: 'center',
    lineHeight: scaleFontSize(16) * 1.5,
  },
});

export default TopicList;