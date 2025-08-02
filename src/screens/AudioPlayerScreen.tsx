/**
 * Main audio player screen with full-screen layout
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  ViewStyle,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAudioPlayer } from '../hooks';
import { useProgress } from '../hooks/useProgress';
import { useResponsiveStyles, useLayoutConfig } from '../hooks/useOrientation';
import {
  AudioControls,
  ProgressBar,
  VolumeControl,
  TopicInfo,
  ResumeDialog,
} from '../components/audio';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { AudioTopic } from '../types';
import { getResponsivePadding, scaleFontSize } from '../utils/responsive';

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
    publishDate: new Date().toISOString(), // Convert to ISO string for serialization
    thumbnailUrl: 'https://picsum.photos/400/400',
    metadata: {
      bitrate: 128,
      format: 'mp3',
      size: 5000000,
    },
  };
  
  const { topic = mockTopic, playlist = [] } = route?.params || {};
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  // Responsive design hooks
  const { isLandscape, isTablet, getResponsiveStyle } = useResponsiveStyles();
  const { audioPlayer } = useLayoutConfig();

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

  const {
    resumeDialog,
    startTracking,
    stopTracking,
    updateTopicProgress,
    markCompleted,
    checkForResumeDialog,
    showResume,
    hideResume,
    getTopicProgress,
    isTopicCompleted,
    getProgressPercentage,
  } = useProgress();

  // Check for resume dialog when topic changes
  useEffect(() => {
    const checkResume = async () => {
      if (topic && !hasCheckedResume) {
        const { shouldShow, resumePosition } = await checkForResumeDialog(topic.id);
        
        if (shouldShow) {
          showResume(topic.id, resumePosition);
        } else {
          // Load topic normally if no resume needed
          loadTopic(topic);
          startTracking(topic);
        }
        
        setHasCheckedResume(true);
      }
    };

    checkResume();
  }, [topic, hasCheckedResume, checkForResumeDialog, showResume, loadTopic, startTracking]);

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

  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

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

  // Resume dialog handlers
  const handleResumeFromPosition = async () => {
    hideResume();
    if (topic) {
      await loadTopic(topic);
      await startTracking(topic);
      if (resumeDialog.resumePosition > 0) {
        seekTo(resumeDialog.resumePosition);
      }
    }
  };

  const handleStartOver = async () => {
    hideResume();
    if (topic) {
      await loadTopic(topic);
      await startTracking(topic);
    }
  };

  const handleCancelResume = () => {
    hideResume();
    navigation?.goBack();
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

      {/* Resume Dialog */}
      <ResumeDialog
        visible={resumeDialog.visible}
        topic={topic}
        resumePosition={resumeDialog.resumePosition}
        onResume={handleResumeFromPosition}
        onStartOver={handleStartOver}
        onCancel={handleCancelResume}
      />
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
            onPress={() => navigation?.goBack()}
            testID="back-button"
          >
            <Icon name="arrow-back" size={isLandscape ? 20 : 24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isLandscape && !isTablet ? (
          // Landscape layout for phones - horizontal arrangement
          <View style={styles.landscapeContent}>
            <View style={styles.landscapeLeft}>
              {/* Topic Information */}
              <View style={[styles.topicInfoContainer, { flex: audioPlayer.topicInfoFlex }]}>
                <TopicInfo
                  topic={currentTopic || topic}
                  layout={audioPlayer.compactLayout ? "compact" : "full"}
                />
              </View>
            </View>
            
            <View style={styles.landscapeRight}>
              {/* Progress Bar */}
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

              {/* Volume Control */}
              {audioPlayer.showVolumeControl && (
                <View style={styles.volumeContainer}>
                  <VolumeControl
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    orientation="horizontal"
                  />
                </View>
              )}
            </View>
          </View>
        ) : (
          // Portrait layout or tablet - vertical arrangement
          <>
            {/* Topic Information */}
            <View style={[styles.topicInfoContainer, { flex: audioPlayer.topicInfoFlex }]}>
              <TopicInfo
                topic={currentTopic || topic}
                layout="full"
              />
            </View>

            {/* Progress Bar */}
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

            {/* Volume Control */}
            <View style={styles.volumeContainer}>
              <VolumeControl
                volume={volume}
                onVolumeChange={handleVolumeChange}
                orientation="horizontal"
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
  } as ViewStyle,

  contentPortrait: {
    paddingTop: getResponsivePadding(20),
    paddingBottom: getResponsivePadding(40),
  } as ViewStyle,

  contentLandscape: {
    paddingTop: getResponsivePadding(10),
    paddingBottom: getResponsivePadding(20),
  } as ViewStyle,

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(16),
  } as ViewStyle,

  headerPortrait: {
    paddingTop: getResponsivePadding(10),
    paddingBottom: getResponsivePadding(10),
  } as ViewStyle,

  headerLandscape: {
    paddingTop: getResponsivePadding(5),
    paddingBottom: getResponsivePadding(5),
  } as ViewStyle,

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  topicInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  } as ViewStyle,

  progressContainer: {
    paddingVertical: getResponsivePadding(20),
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