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
  const progressBarRef = useRef<View>(null);
  const [barWidth, setBarWidth] = useState(300);

  const progress = duration > 0 ? currentTime / duration : 0;
  const displayProgress = isDragging ? dragPosition : progress;

  // Pan responder for dragging the slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start pan responder if there's actual movement
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      
      onPanResponderGrant: (event) => {
        setIsDragging(true);
        const { locationX } = event.nativeEvent;
        const newProgress = Math.max(0, Math.min(1, locationX / barWidth));
        setDragPosition(newProgress);
      },
      
      onPanResponderMove: (event) => {
        const { locationX } = event.nativeEvent;
        const newProgress = Math.max(0, Math.min(1, locationX / barWidth));
        setDragPosition(newProgress);
      },
      
      onPanResponderRelease: (event) => {
        const { locationX } = event.nativeEvent;
        const finalProgress = Math.max(0, Math.min(1, locationX / barWidth));
        
        if (duration > 0) {
          const seekTime = finalProgress * duration;
          onSeek(seekTime);
        }
        setIsDragging(false);
      },
      
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // Handle progress bar press for seeking
  const handleProgressBarPress = useCallback(
    (event: any) => {
      const { locationX } = event.nativeEvent;
      const newProgress = Math.max(0, Math.min(1, locationX / barWidth));
      const seekTime = newProgress * duration;
      onSeek(seekTime);
    },
    [duration, onSeek, barWidth]
  );

  // Measure the progress bar width
  const onLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    setBarWidth(width);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.progressContainer}>
        <View
          ref={progressBarRef}
          style={styles.progressBar}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.progressBarTouchable}
            onPress={handleProgressBarPress}
            activeOpacity={1}
            testID="progress-bar"
          >
            <View style={styles.progressTrack} />
            <View
              style={[
                styles.progressFill,
                { width: `${displayProgress * 100}%` },
              ]}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.progressThumb,
              {
                left: `${displayProgress * 100}%`,
                opacity: isDragging ? 1 : 0.9,
                transform: [{ scale: isDragging ? 1.3 : 1 }],
              },
            ]}
          />
        </View>
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
    color: '#1a2332', // Dark navy for better contrast
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  } as TextStyle,

  progressContainer: {
    height: 40,
    justifyContent: 'center',
  } as ViewStyle,

  progressBar: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  } as ViewStyle,

  progressBarTouchable: {
    height: 20,
    backgroundColor: 'transparent',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  } as ViewStyle,

  progressTrack: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Dark semi-transparent track
    borderRadius: 2,
  } as ViewStyle,

  progressFill: {
    position: 'absolute',
    top: 8,
    left: 0,
    height: 4,
    backgroundColor: '#059669', // Green for health theme
    borderRadius: 2,
  } as ViewStyle,

  progressThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    backgroundColor: '#059669', // Green for health theme
    borderRadius: 10,
    marginLeft: -10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  } as ViewStyle,
});

export default ProgressBar;