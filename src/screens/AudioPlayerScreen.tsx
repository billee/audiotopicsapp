/**
 * Main audio player screen with full-screen layout
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  ViewStyle,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAudioPlayer } from '../hooks';
import { useProgress } from '../hooks/useProgress';
import { useResponsiveStyles, useLayoutConfig } from '../hooks/useOrientation';
import { useBackgroundImage } from '../hooks/useBackgroundImage';
import {
  AudioControls,
  ProgressBar,
  TopicInfo,
} from '../components/audio';
import { LoadingSpinner, ErrorMessage, BackgroundImage } from '../components/common';
import { AudioTopic } from '../types';
import { BackgroundContext } from '../types/backgroundImage';
import { getResponsivePadding, scaleFontSize } from '../utils/responsive';
import { getRandomAmbientBackground } from '../assets/backgrounds';

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
    id: 'topic1',
    title: 'Mga Balitang Pang-ekonomiya ngayong Linggo',
    description: 'Weekly economic news and updates affecting families and personal finances.',
    categoryId: 'cat1',
    audioUrl: 'https://raw.githubusercontent.com/billee/audiotopicsapp/main/android/app/src/main/assets/audio/ElevenLabs_Sarah.mp3',
    duration: 180,
    author: 'Sarah',
    publishDate: new Date().toISOString(), // Convert to ISO string for serialization
    thumbnailUrl: 'https://via.placeholder.com/300x200/E8F5E8/2D5016?text=Economic+News',
    metadata: {
      bitrate: 128,
      format: 'mp3',
      size: 2880000,
    },
  };

  const { topic = mockTopic, playlist = [] } = route?.params || {};

  // Responsive design hooks
  const { isLandscape, isTablet, getResponsiveStyle } = useResponsiveStyles();
  const { audioPlayer } = useLayoutConfig();

  // Background image management
  const { getBackgroundImage, preloadSpecificImage } = useBackgroundImage();
  const [ambientBackground, setAmbientBackground] = useState<string | null>(null);

  const {
    currentTopic,
    isPlaying,
    currentPosition,
    duration,

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

    skipNext,
    skipPrevious,
    skipForward,
    skipBackward,
  } = useAudioPlayer();



  const {
    startTracking,
    stopTracking,
    updateTopicProgress,
    markCompleted,
  } = useProgress();

  // Load topic when component mounts
  useEffect(() => {
    const loadTopicOnMount = async () => {
      if (topic) {
        await loadTopic(topic);
        startTracking(topic);
      }
    };

    loadTopicOnMount();
  }, [topic, loadTopic, startTracking]);

  // Set up ambient background for audio player
  useEffect(() => {
    const setupAmbientBackground = async () => {
      try {
        // First try to get category-specific background
        let backgroundUrl: string;

        const context: BackgroundContext = {
          type: 'audio-player',
          categoryId: topic?.categoryId?.toString(), // Pass categoryId for science-specific backgrounds
          topicId: topic?.id
        };
        console.log('AudioPlayerScreen - using context:', context);
        backgroundUrl = getBackgroundImage(context);

        // If no category-specific background, try topic thumbnail
        if (!backgroundUrl || backgroundUrl === getBackgroundImage({ type: 'audio-player' })) {
          if (topic?.thumbnailUrl) {
            // Use topic thumbnail as background if available
            backgroundUrl = topic.thumbnailUrl;
          } else {
            // Final fallback to random ambient background
            const randomAmbient = getRandomAmbientBackground();
            backgroundUrl = randomAmbient.remote;
          }
        }

        // Preload the background image for better performance
        if (backgroundUrl && typeof backgroundUrl === 'string') {
          await preloadSpecificImage(backgroundUrl);
        }
        setAmbientBackground(backgroundUrl);
      } catch (error) {
        console.warn('Failed to setup ambient background:', error);
        // Fallback to default ambient background
        const defaultAmbient = getRandomAmbientBackground();
        setAmbientBackground(defaultAmbient.remote);
      }
    };

    setupAmbientBackground();
  }, [topic, getBackgroundImage, preloadSpecificImage]);

  // Update progress during playback
  useEffect(() => {
    if (currentTopic && isPlaying && currentPosition > 0) {
      updateTopicProgress(currentTopic.id, currentPosition);
    }
  }, [currentTopic, isPlaying, currentPosition, updateTopicProgress]);

  // Mark as completed when playback finishes
  useEffect(() => {
    if (currentTopic && duration > 0 && currentPosition >= duration * 0.95) {
      markCompleted(currentTopic.id);
    }
  }, [currentTopic, currentPosition, duration, markCompleted]);

  // Stop tracking and audio when component unmounts
  useEffect(() => {
    return () => {
      // Stop audio if playing
      if (isPlaying) {
        togglePlayback();
      }
      stopTracking();
    };
  }, [stopTracking, isPlaying, togglePlayback]);

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





  // Handle back button press - stop audio and clean up
  const handleBackPress = useCallback(() => {
    console.log('AudioPlayerScreen - Back button pressed');
    console.log('AudioPlayerScreen - Navigation object:', navigation);

    // Stop progress tracking first
    try {
      stopTracking();
      console.log('AudioPlayerScreen - Progress tracking stopped');
    } catch (error) {
      console.error('AudioPlayerScreen - Error stopping progress tracking:', error);
    }

    // Stop audio playback if playing (don't await to avoid blocking navigation)
    if (isPlaying) {
      console.log('AudioPlayerScreen - Stopping audio playback');
      togglePlayback().catch(error => {
        console.error('AudioPlayerScreen - Error stopping audio:', error);
      });
    }

    // Navigate back immediately
    console.log('AudioPlayerScreen - Calling navigation.goBack()');
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else {
      console.error('AudioPlayerScreen - Navigation goBack not available or not a function');
    }
  }, [isPlaying, togglePlayback, stopTracking, navigation]);

  // Get the appropriate background image for audio player
  const getAudioPlayerBackground = useCallback(() => {
    // Use the ambient background we set up
    if (ambientBackground) {
      return ambientBackground;
    }

    // Fallback to topic thumbnail if available
    if (currentTopic?.thumbnailUrl || topic?.thumbnailUrl) {
      return currentTopic?.thumbnailUrl || topic?.thumbnailUrl;
    }

    // Final fallback to default ambient background
    const defaultAmbient = getRandomAmbientBackground();
    return defaultAmbient.remote;
  }, [ambientBackground, currentTopic?.thumbnailUrl, topic?.thumbnailUrl]);

  const backgroundImageSource = getAudioPlayerBackground();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <BackgroundImage
        source={backgroundImageSource}
        resizeMode="stretch" // Stretch image to cover full height and width
        overlay={true}
        overlayOpacity={0.3} // Lower opacity for ambient feel while ensuring control visibility
        overlayColors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']} // Gradient overlay for better contrast
        fallbackColor="#0f0f0f" // Dark fallback for audio player
        showLoadingState={false} // Disable loading state to prevent UI confusion
        showErrorState={false} // Disable error state to prevent UI confusion
        enableResponsiveImages={false} // Disable responsive images to prevent URL issues
        testID="audio-player-background"
      >
        {renderContent()}
      </BackgroundImage>
    </View>
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
      <View style={[
        styles.content,
        getResponsiveStyle(styles.contentPortrait, styles.contentLandscape)
      ]}>
        {/* Back Button */}
        <View style={[
          styles.headerContainer,
          getResponsiveStyle(styles.headerPortrait, styles.headerLandscape)
        ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            testID="back-button"
          >
            <Icon name="arrow-back" size={isLandscape ? 20 : 24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isLandscape && !isTablet ? (
          // Landscape layout for phones - horizontal arrangement
          <View style={styles.landscapeContent}>
            <View style={styles.landscapeLeft}>
              {/* Topic Information with Progress Bar */}
              <View style={[styles.topicInfoContainer, { flex: audioPlayer.topicInfoFlex }]}>
                <TopicInfo
                  topic={currentTopic || topic}
                  layout={audioPlayer.compactLayout ? "compact" : "full"}
                />

                {/* Progress Bar - moved below TopicInfo */}
                <View style={[styles.progressContainer, { paddingVertical: audioPlayer.controlsSpacing }]}>
                  <ProgressBar
                    currentTime={currentPosition}
                    duration={duration}
                    formattedCurrentTime={formattedCurrentTime}
                    formattedDuration={formattedDuration}
                    onSeek={handleSeek}
                    showTimeLabels={true}
                  />
                </View>
              </View>
            </View>

            <View style={styles.landscapeRight}>
              {/* Audio Controls */}
              <View style={[styles.controlsContainer, { paddingVertical: audioPlayer.controlsSpacing }]}>
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
                  size={audioPlayer.compactLayout ? "medium" : "large"}
                />
              </View>


            </View>
          </View>
        ) : (
          // Portrait layout or tablet - vertical arrangement
          <>
            {/* Topic Information with Progress Bar */}
            <View style={[styles.topicInfoContainer, { flex: audioPlayer.topicInfoFlex }]}>
              <TopicInfo
                topic={currentTopic || topic}
                layout="full"
              />

              {/* Progress Bar - moved below TopicInfo */}
              <View style={[styles.progressContainer, { paddingVertical: audioPlayer.controlsSpacing }]}>
                <ProgressBar
                  currentTime={currentPosition}
                  duration={duration}
                  formattedCurrentTime={formattedCurrentTime}
                  formattedDuration={formattedDuration}
                  onSeek={handleSeek}
                  showTimeLabels={true}
                />
              </View>
            </View>

            {/* Audio Controls */}
            <View style={[styles.controlsContainer, { paddingVertical: audioPlayer.controlsSpacing }]}>
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


          </>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f', // Dark fallback for audio player
  } as ViewStyle,

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 0,
  } as ViewStyle,

  contentPortrait: {
    paddingTop: getResponsivePadding(0),
    paddingBottom: getResponsivePadding(20),
  } as ViewStyle,

  contentLandscape: {
    paddingTop: getResponsivePadding(0),
    paddingBottom: getResponsivePadding(10),
  } as ViewStyle,

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(16),
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 30,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure back button is always on top
  } as ViewStyle,

  headerPortrait: {
    paddingBottom: getResponsivePadding(0),
  } as ViewStyle,

  headerLandscape: {
    paddingBottom: getResponsivePadding(0),
  } as ViewStyle,

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Increased opacity for better visibility over ambient backgrounds
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10, // Higher elevation for Android to ensure it's on top
    zIndex: 1001, // Ensure it's above everything else
  } as ViewStyle,

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  topicInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 100,
    marginTop: 80, // Add positive margin to push content below the back button
    paddingTop: 20, // Additional padding for better spacing
  } as ViewStyle,

  progressContainer: {
    paddingVertical: getResponsivePadding(10),
    paddingTop: getResponsivePadding(5),
  } as ViewStyle,

  controlsContainer: {
    paddingVertical: getResponsivePadding(20),
  } as ViewStyle,

  volumeContainer: {
    alignItems: 'center',
    paddingVertical: getResponsivePadding(10),
  } as ViewStyle,

  // Landscape-specific styles
  landscapeContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: getResponsivePadding(16),
  } as ViewStyle,

  landscapeLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: getResponsivePadding(16),
  } as ViewStyle,

  landscapeRight: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: getResponsivePadding(16),
  } as ViewStyle,

  errorMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: getResponsivePadding(20),
    margin: getResponsivePadding(20),
  } as ViewStyle,
});

export default AudioPlayerScreen;