/**
 * Audio controls component with play/pause, skip, and volume controls
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AudioControlsProps {
  isPlaying: boolean;
  canPlay: boolean;
  hasNextTrack: boolean;
  hasPreviousTrack: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  canPlay,
  hasNextTrack,
  hasPreviousTrack,
  onPlayPause,
  onNext,
  onPrevious,
  onSkipForward,
  onSkipBackward,
  style,
  size = 'large',
}) => {
  const iconSizes = {
    small: { main: 32, secondary: 24 },
    medium: { main: 48, secondary: 32 },
    large: { main: 64, secondary: 40 },
  };

  const buttonSizes = {
    small: { main: 48, secondary: 40 },
    medium: { main: 64, secondary: 48 },
    large: { main: 80, secondary: 56 },
  };

  const currentIconSize = iconSizes[size];
  const currentButtonSize = buttonSizes[size];

  return (
    <View style={[styles.container, style]}>
      {/* Skip Backward */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          styles.secondaryButton,
          {
            width: currentButtonSize.secondary,
            height: currentButtonSize.secondary,
          },
        ]}
        onPress={onSkipBackward}
        disabled={!canPlay}
        testID="skip-backward-button"
      >
        <Icon
          name="replay-15"
          size={currentIconSize.secondary}
          color={canPlay ? '#FFFFFF' : '#666666'}
        />
      </TouchableOpacity>

      {/* Previous Track */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          styles.secondaryButton,
          {
            width: currentButtonSize.secondary,
            height: currentButtonSize.secondary,
          },
        ]}
        onPress={onPrevious}
        disabled={!hasPreviousTrack}
        testID="previous-button"
      >
        <Icon
          name="skip-previous"
          size={currentIconSize.secondary}
          color={hasPreviousTrack ? '#FFFFFF' : '#666666'}
        />
      </TouchableOpacity>

      {/* Play/Pause */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          styles.playButton,
          {
            width: currentButtonSize.main,
            height: currentButtonSize.main,
          },
        ]}
        onPress={onPlayPause}
        disabled={!canPlay}
        testID="play-pause-button"
      >
        <Icon
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={currentIconSize.main}
          color={canPlay ? '#FFFFFF' : '#666666'}
        />
      </TouchableOpacity>

      {/* Next Track */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          styles.secondaryButton,
          {
            width: currentButtonSize.secondary,
            height: currentButtonSize.secondary,
          },
        ]}
        onPress={onNext}
        disabled={!hasNextTrack}
        testID="next-button"
      >
        <Icon
          name="skip-next"
          size={currentIconSize.secondary}
          color={hasNextTrack ? '#FFFFFF' : '#666666'}
        />
      </TouchableOpacity>

      {/* Skip Forward */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          styles.secondaryButton,
          {
            width: currentButtonSize.secondary,
            height: currentButtonSize.secondary,
          },
        ]}
        onPress={onSkipForward}
        disabled={!canPlay}
        testID="skip-forward-button"
      >
        <Icon
          name="forward-15"
          size={currentIconSize.secondary}
          color={canPlay ? '#FFFFFF' : '#666666'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  controlButton: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } as ViewStyle,

  playButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
  } as ViewStyle,

  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
});

export default AudioControls;