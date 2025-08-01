/**
 * Main audio player screen with full-screen layout
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  ViewStyle,
  Alert,
} from 'react-native';

import { useAudioPlayer } from '../hooks';
import {
  AudioControls,
  ProgressBar,
  VolumeControl,
  TopicInfo,
} from '../components/audio';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { AudioTopic } from '../types';

// Navigation types (these should be defined in a navigation types file)
interface AudioPlayerScreenProps {
  route?: {
    params: {
      topic: AudioTopic;
      playlist?: AudioTopic[];
    };
  };
  navigation?: {
    goBack: () => void;
  };
}

const AudioPlayerScreen: React.FC<AudioPlayerScreenProps> = ({ route, navigation }) => {
  // Mock data for development - in real app this would come from route params
  const mockTopic: AudioTopic = {
    id: '1',
    title: 'Sample Audio Topic',
    description: 'This is a sample audio topic for testing the player interface.',
    categoryId: 'category1',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 300,
    author: 'Sample Author',
    publishDate: new Date(),
    thumbnailUrl: 'https://picsum.photos/400/400',
    metadata: {
      bitrate: 128,
      format: 'mp3',
      size: 5000000,
    },
  };
  
  const { topic = mockTopic, playlist = [] } = route?.params || {};

  const {
    currentTopic,
    isPlaying,
    currentPosition,
    duration,
    volume,
    isLoading,
    error,
    canPlay,
    hasNextTrack,
    hasPreviousTrack,
    progress,
    formattedCurrentTime,
    formattedDuration,
    loadTopic,
    togglePlayback,
    seekTo,
    setVolumeLevel,
    skipNext,
    skipPrevious,
    skipForward,
    skipBackward,
  } = useAudioPlayer();

  // Load the topic when the screen mounts
  useEffect(() => {
    if (topic) {
      loadTopic(topic);
    }
  }, [topic, loadTopic]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Audio Error',
        error,
        [
          {
            text: 'Retry',
            onPress: () => {
              if (topic) {
                loadTopic(topic);
              }
            },
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    }
  }, [error, topic, loadTopic, navigation]);

  const handleSeek = (position: number) => {
    seekTo(position);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeLevel(newVolume);
  };

  const backgroundImage = currentTopic?.thumbnailUrl || topic?.thumbnailUrl;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {backgroundImage ? (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
          testID="background-image"
        >
          <View style={styles.overlay}>
            {renderContent()}
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.defaultBackground}>
          {renderContent()}
        </View>
      )}
    </SafeAreaView>
  );

  function renderContent() {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <LoadingSpinner size="large" color="#FFFFFF" />
        </View>
      );
    }

    if (error && !currentTopic) {
      return (
        <View style={styles.centerContent}>
          <ErrorMessage
            message={error}
            onRetry={() => topic && loadTopic(topic)}
          />
        </View>
      );
    }

    return (
      <View style={styles.content}>
        {/* Topic Information */}
        <View style={styles.topicInfoContainer}>
          <TopicInfo
            topic={currentTopic || topic}
            layout="full"
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            currentTime={currentPosition}
            duration={duration}
            formattedCurrentTime={formattedCurrentTime}
            formattedDuration={formattedDuration}
            onSeek={handleSeek}
            showTimeLabels={true}

          />
        </View>

        {/* Audio Controls */}
        <View style={styles.controlsContainer}>
          <AudioControls
            isPlaying={isPlaying}
            canPlay={canPlay}
            hasNextTrack={hasNextTrack}
            hasPreviousTrack={hasPreviousTrack}
            onPlayPause={togglePlayback}
            onNext={skipNext}
            onPrevious={skipPrevious}
            onSkipForward={() => skipForward(15)}
            onSkipBackward={() => skipBackward(15)}
            size="large"

          />
        </View>

        {/* Volume Control */}
        <View style={styles.volumeContainer}>
          <VolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
            orientation="horizontal"

          />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  } as ViewStyle,

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  } as ViewStyle,

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  } as ViewStyle,

  defaultBackground: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  } as ViewStyle,

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
  } as ViewStyle,

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  topicInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  } as ViewStyle,

  progressContainer: {
    paddingVertical: 20,
  } as ViewStyle,

  controlsContainer: {
    paddingVertical: 20,
  } as ViewStyle,

  volumeContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  } as ViewStyle,

  errorMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  } as ViewStyle,
});

export default AudioPlayerScreen;