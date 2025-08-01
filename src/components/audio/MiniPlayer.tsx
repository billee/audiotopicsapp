/**
 * Mini player component for background playback
 * Provides compact controls and persistent overlay during background playback
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AudioTopic } from '../../types';

interface MiniPlayerProps {
  currentTopic: AudioTopic | null;
  isPlaying: boolean;
  isVisible: boolean;
  progress: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onExpand: () => void;
  onClose: () => void;
  hasNextTrack: boolean;
  hasPreviousTrack: boolean;
  canPlay: boolean;
  style?: ViewStyle;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTopic,
  isPlaying,
  isVisible,
  progress,
  onPlayPause,
  onNext,
  onPrevious,
  onExpand,
  onClose,
  hasNextTrack,
  hasPreviousTrack,
  canPlay,
  style,
}) => {
  const translateY = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Animate visibility
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isVisible ? 0 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, translateY, opacity]);

  // Handle dismiss animation
  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!currentTopic) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      testID="mini-player"
    >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(100, progress * 100))}%` },
              ]}
            />
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Topic info - tappable to expand */}
          <TouchableOpacity
            style={styles.topicInfo}
            onPress={onExpand}
            testID="mini-player-expand"
          >
            <Text style={styles.topicTitle} numberOfLines={1}>
              {currentTopic.title}
            </Text>
            <Text style={styles.topicAuthor} numberOfLines={1}>
              {currentTopic.author || 'Unknown Artist'}
            </Text>
          </TouchableOpacity>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Previous */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !hasPreviousTrack && styles.disabledButton,
              ]}
              onPress={onPrevious}
              disabled={!hasPreviousTrack}
              testID="mini-player-previous"
            >
              <Icon
                name="skip-previous"
                size={24}
                color={hasPreviousTrack ? '#FFFFFF' : '#666666'}
              />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.playButton,
                !canPlay && styles.disabledButton,
              ]}
              onPress={onPlayPause}
              disabled={!canPlay}
              testID="mini-player-play-pause"
            >
              <Icon
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={28}
                color={canPlay ? '#FFFFFF' : '#666666'}
              />
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !hasNextTrack && styles.disabledButton,
              ]}
              onPress={onNext}
              disabled={!hasNextTrack}
              testID="mini-player-next"
            >
              <Icon
                name="skip-next"
                size={24}
                color={hasNextTrack ? '#FFFFFF' : '#666666'}
              />
            </TouchableOpacity>

            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              testID="mini-player-close"
            >
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } as ViewStyle,

  progressContainer: {
    height: 2,
    backgroundColor: 'transparent',
  } as ViewStyle,

  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,

  progressFill: {
    height: 2,
    backgroundColor: '#007AFF',
  } as ViewStyle,

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  } as ViewStyle,

  topicInfo: {
    flex: 1,
    marginRight: 16,
  } as ViewStyle,

  topicTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  } as TextStyle,

  topicAuthor: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
  } as TextStyle,

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  } as ViewStyle,

  playButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
  } as ViewStyle,

  disabledButton: {
    opacity: 0.5,
  } as ViewStyle,

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
});

export default MiniPlayer;
</content>
</invoke>