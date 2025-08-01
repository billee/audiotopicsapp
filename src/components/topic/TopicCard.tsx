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

interface TopicCardProps {
  topic: AudioTopic;
  progress?: ProgressData | null;
  onPress: (topic: AudioTopic) => void;
  isPlaying?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  progress,
  onPress,
  isPlaying = false,
}) => {
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isPlaying && styles.playingContainer,
        isCompleted && styles.completedContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {topic.thumbnailUrl ? (
          <Image
            source={{ uri: topic.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Text style={styles.placeholderText}>♪</Text>
          </View>
        )}
        {getStatusIndicator()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {topic.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {topic.description}
        </Text>
        
        <View style={styles.metadata}>
          <Text style={styles.duration}>
            {formatDuration(topic.duration)}
          </Text>
          {topic.author && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.author} numberOfLines={1}>
                {topic.author}
              </Text>
            </>
          )}
        </View>

        {/* Progress Bar */}
        {(isInProgress || isCompleted) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                  isCompleted && styles.completedProgress,
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
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
    borderRadius: 12,
    padding: 16,
    marginHorizontal: CARD_MARGIN,
    marginVertical: 8,
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
    marginRight: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#6C6C70',
    lineHeight: 18,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  duration: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#C7C7CC',
    marginHorizontal: 6,
  },
  author: {
    fontSize: 12,
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
    marginRight: 8,
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
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
});

export default TopicCard;