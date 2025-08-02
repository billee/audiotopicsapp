/**
 * TopicCard component - Displays individual topic with progress indicators
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { AudioTopic, ProgressData } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { useLayoutConfig, useResponsiveStyles } from '../../hooks/useOrientation';
import { 
  scaleFontSize, 
  getResponsivePadding, 
  getResponsiveBorderRadius,
  getResponsiveMargin 
} from '../../utils/responsive';

interface TopicCardProps {
  topic: AudioTopic;
  progress?: ProgressData | null;
  onPress: (topic: AudioTopic) => void;
  isPlaying?: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  progress,
  onPress,
  isPlaying = false,
}) => {
  const { topicList } = useLayoutConfig();
  const { isLandscape, isTablet } = useResponsiveStyles();
  const progressPercentage = progress 
    ? Math.min((progress.position / topic.duration) * 100, 100)
    : 0;

  const isCompleted = progress?.completed || false;
  const isInProgress = progress && !progress.completed && progress.position > 0;

  const handlePress = () => {
    onPress(topic);
  };

  const getStatusIndicator = () => {
    if (isPlaying) {
      return (
        <View style={[styles.statusIndicator, styles.playingIndicator]}>
          <Text style={styles.statusText}>♪</Text>
        </View>
      );
    }
    
    if (isCompleted) {
      return (
        <View style={[styles.statusIndicator, styles.completedIndicator]}>
          <Text style={styles.statusText}>✓</Text>
        </View>
      );
    }
    
    if (isInProgress) {
      return (
        <View style={[styles.statusIndicator, styles.inProgressIndicator]}>
          <Text style={styles.statusText}>▶</Text>
        </View>
      );
    }
    
    return null;
  };

  // Calculate responsive thumbnail size
  const thumbnailSize = topicList.compactMode ? 60 : 80;
  const showThumbnails = topicList.showThumbnails;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          height: topicList.itemHeight,
          padding: getResponsivePadding(16),
          marginHorizontal: getResponsiveMargin(16),
          marginVertical: getResponsiveMargin(8),
        },
        isPlaying && styles.playingContainer,
        isCompleted && styles.completedContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      {showThumbnails && (
        <View style={[styles.thumbnailContainer, { marginRight: getResponsiveMargin(16) }]}>
          {topic.thumbnailUrl ? (
            <Image
              source={{ uri: topic.thumbnailUrl }}
              style={[
                styles.thumbnail,
                { 
                  width: thumbnailSize, 
                  height: thumbnailSize,
                  borderRadius: getResponsiveBorderRadius(8),
                }
              ]}
              resizeMode="cover"
            />
          ) : (
            <View style={[
              styles.thumbnail, 
              styles.placeholderThumbnail,
              { 
                width: thumbnailSize, 
                height: thumbnailSize,
                borderRadius: getResponsiveBorderRadius(8),
              }
            ]}>
              <Text style={[
                styles.placeholderText,
                { fontSize: scaleFontSize(topicList.compactMode ? 20 : 24) }
              ]}>♪</Text>
            </View>
          )}
          {getStatusIndicator()}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[
          styles.title,
          { 
            fontSize: scaleFontSize(topicList.compactMode ? 14 : 16),
            lineHeight: scaleFontSize(topicList.compactMode ? 14 : 16) * 1.25,
            marginBottom: getResponsiveMargin(4),
          }
        ]} numberOfLines={topicList.compactMode ? 1 : 2}>
          {topic.title}
        </Text>
        
        {!topicList.compactMode && (
          <Text style={[
            styles.description,
            { 
              fontSize: scaleFontSize(14),
              lineHeight: scaleFontSize(14) * 1.3,
              marginBottom: getResponsiveMargin(8),
            }
          ]} numberOfLines={2}>
            {topic.description}
          </Text>
        )}
        
        <View style={[styles.metadata, { marginBottom: getResponsiveMargin(8) }]}>
          <Text style={[
            styles.duration,
            { fontSize: scaleFontSize(12) }
          ]}>
            {formatDuration(topic.duration)}
          </Text>
          {topic.author && !topicList.compactMode && (
            <>
              <Text style={[
                styles.separator,
                { 
                  fontSize: scaleFontSize(12),
                  marginHorizontal: getResponsiveMargin(6),
                }
              ]}>•</Text>
              <Text style={[
                styles.author,
                { fontSize: scaleFontSize(12) }
              ]} numberOfLines={1}>
                {topic.author}
              </Text>
            </>
          )}
        </View>

        {/* Progress Bar */}
        {(isInProgress || isCompleted) && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { marginRight: getResponsiveMargin(8) }]}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                  isCompleted && styles.completedProgress,
                ]} 
              />
            </View>
            <Text style={[
              styles.progressText,
              { fontSize: scaleFontSize(10) }
            ]}>
              {isCompleted ? 'Completed' : `${Math.round(progressPercentage)}%`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveBorderRadius(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playingContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  completedContainer: {
    opacity: 0.8,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    // width, height, and borderRadius will be set dynamically
  },
  placeholderThumbnail: {
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
  },
  statusIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  playingIndicator: {
    backgroundColor: '#007AFF',
  },
  completedIndicator: {
    backgroundColor: '#34C759',
  },
  inProgressIndicator: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(12),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  description: {
    color: '#6C6C70',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: '#007AFF',
    fontWeight: '500',
  },
  separator: {
    color: '#C7C7CC',
  },
  author: {
    color: '#8E8E93',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  completedProgress: {
    backgroundColor: '#34C759',
  },
  progressText: {
    color: '#8E8E93',
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
});

export default TopicCard;