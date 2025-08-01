/**
 * Volume control component with slider
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  style,
  orientation = 'horizontal',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getVolumeIcon = () => {
    if (volume === 0) return 'volume-off';
    if (volume < 0.5) return 'volume-down';
    return 'volume-up';
  };

  const handleVolumePress = () => {
    setIsExpanded(!isExpanded);
  };

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    onVolumeChange(clampedVolume);
  };

  const handleSliderPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const sliderLength = 100; // This should be measured dynamically
    
    let newVolume: number;
    if (orientation === 'horizontal') {
      newVolume = locationX / sliderLength;
    } else {
      newVolume = 1 - (locationY / sliderLength);
    }
    
    handleVolumeChange(newVolume);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.volumeButton}
        onPress={handleVolumePress}
        testID="volume-button"
      >
        <Icon
          name={getVolumeIcon()}
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View
          style={[
            styles.sliderContainer,
            orientation === 'vertical' ? styles.verticalSlider : styles.horizontalSlider,
          ]}
        >
          <View
            style={[
              styles.slider,
              orientation === 'vertical' ? styles.verticalSliderTrack : styles.horizontalSliderTrack,
            ]}
            onTouchEnd={handleSliderPress}
            testID="volume-slider"
          >
            <View style={styles.sliderTrack} />
            <View
              style={[
                styles.sliderFill,
                orientation === 'vertical'
                  ? {
                      height: `${volume * 100}%`,
                      bottom: 0,
                    }
                  : {
                      width: `${volume * 100}%`,
                      left: 0,
                    },
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                orientation === 'vertical'
                  ? {
                      bottom: `${volume * 100}%`,
                      left: '50%',
                      marginLeft: -6,
                      marginBottom: -6,
                    }
                  : {
                      left: `${volume * 100}%`,
                      top: '50%',
                      marginLeft: -6,
                      marginTop: -6,
                    },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  sliderContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
  } as ViewStyle,

  horizontalSlider: {
    top: -50,
    left: -30,
    width: 100,
    height: 40,
  } as ViewStyle,

  verticalSlider: {
    top: -110,
    left: -10,
    width: 40,
    height: 100,
  } as ViewStyle,

  slider: {
    position: 'relative',
  } as ViewStyle,

  horizontalSliderTrack: {
    width: '100%',
    height: 4,
  } as ViewStyle,

  verticalSliderTrack: {
    width: 4,
    height: '100%',
    alignSelf: 'center',
  } as ViewStyle,

  sliderTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  } as ViewStyle,

  sliderFill: {
    position: 'absolute',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  } as ViewStyle,

  sliderThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
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

export default VolumeControl;