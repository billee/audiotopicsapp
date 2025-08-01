/**
 * Topic information display component
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { AudioTopic } from '../../types';

interface TopicInfoProps {
  topic: AudioTopic | null;
  style?: ViewStyle;
  layout?: 'compact' | 'full';
}

const TopicInfo: React.FC<TopicInfoProps> = ({
  topic,
  style,
  layout = 'full',
}) => {
  if (!topic) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No topic selected</Text>
        </View>
      </View>
    );
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (layout === 'compact') {
    return (
      <View style={[styles.container, styles.compactContainer, style]}>
        {topic.thumbnailUrl && (
          <Image
            source={{ uri: topic.thumbnailUrl }}
            style={styles.compactThumbnail}
            testID="topic-thumbnail"
          />
        )}
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1} testID="topic-title">
            {topic.title}
          </Text>
          <Text style={styles.compactAuthor} numberOfLines={1} testID="topic-author">
            {topic.author || 'Unknown Artist'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {topic.thumbnailUrl && (
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: topic.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            testID="topic-thumbnail"
          />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.title} testID="topic-title">
          {topic.title}
        </Text>

        {topic.author && (
          <Text style={styles.author} testID="topic-author">
            {topic.author}
          </Text>
        )}

        {topic.description && (
          <Text style={styles.description} numberOfLines={3} testID="topic-description">
            {topic.description}
          </Text>
        )}

        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Duration:</Text>
            <Text style={styles.metadataValue} testID="topic-duration">
              {formatDuration(topic.duration)}
            </Text>
          </View>

          {topic.publishDate && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Published:</Text>
              <Text style={styles.metadataValue} testID="topic-publish-date">
                {formatDate(topic.publishDate)}
              </Text>
            </View>
          )}

          {topic.metadata && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Quality:</Text>
              <Text style={styles.metadataValue} testID="topic-quality">
                {topic.metadata.format.toUpperCase()} • {topic.metadata.bitrate} kbps
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  } as ViewStyle,

  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  } as ViewStyle,

  placeholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontStyle: 'italic',
  } as TextStyle,

  thumbnailContainer: {
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  } as ViewStyle,

  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 12,
  } as ImageStyle,

  compactThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  } as ImageStyle,

  infoContainer: {
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,

  compactInfo: {
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  } as TextStyle,

  compactTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  } as TextStyle,

  author: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,

  compactAuthor: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
  } as TextStyle,

  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  } as TextStyle,

  metadataContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  } as ViewStyle,

  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  metadataLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,

  metadataValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
});

export default TopicInfo;