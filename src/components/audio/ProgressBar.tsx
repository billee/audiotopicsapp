/**
 * Audio progress bar with seek functionality
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  PanResponder,
} from 'react-native';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  onSeek: (position: number) => void;
  style?: ViewStyle;
  showTimeLabels?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  formattedCurrentTime,
  formattedDuration,
  onSeek,
  style,
  showTimeLabels = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  const progress = duration > 0 ? currentTime / duration : 0;
  const displayProgress = isDragging ? dragPosition : progress;

  // Handle progress bar press for seeking
  const handleProgressBarPress = useCallback(
    (event: any) => {
      const { locationX } = event.nativeEvent;
      const barWidth = 300; // This should be measured dynamically
      const newProgress = Math.max(0, Math.min(1, locationX / barWidth));
      const seekTime = newProgress * duration;
      onSeek(seekTime);
    },
    [duration, onSeek]
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.progressContainer}>
        <TouchableOpacity
          style={styles.progressBar}
          onPress={handleProgressBarPress}
          activeOpacity={0.8}
          testID="progress-bar"
        >
          <View style={styles.progressTrack} />
          <View
            style={[
              styles.progressFill,
              { width: `${displayProgress * 100}%` },
            ]}
          />
          <View
            style={[
              styles.progressThumb,
              {
                left: `${displayProgress * 100}%`,
                opacity: isDragging ? 1 : 0.8,
                transform: [{ scale: isDragging ? 1.2 : 1 }],
              },
            ]}
          />
        </TouchableOpacity>
      </View>
      
      {showTimeLabels && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText} testID="current-time">
            {formattedCurrentTime}
          </Text>
          <Text style={styles.timeText} testID="duration">
            {formattedDuration}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  } as ViewStyle,

  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  } as ViewStyle,

  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  } as TextStyle,

  progressContainer: {
    height: 40,
    justifyContent: 'center',
  } as ViewStyle,

  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  } as ViewStyle,

  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  } as ViewStyle,

  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  } as ViewStyle,

  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginLeft: -8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } as ViewStyle,
});

export default ProgressBar;