/**
 * Container component that connects MiniPlayer to Redux store and audio player
 */

import React from 'react';
import { useSelector } from 'react-redux';
import MiniPlayer from './MiniPlayer';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useMiniPlayer } from '../../hooks/useMiniPlayer';
import {
  selectCurrentTopic,
  selectIsPlaying,
  selectCanPlay,
  selectHasNextTrack,
  selectHasPreviousTrack,
  selectPlaybackProgress,
} from '../../store/selectors/audioSelectors';

interface MiniPlayerContainerProps {
  onNavigateToPlayer?: () => void;
}

const MiniPlayerContainer: React.FC<MiniPlayerContainerProps> = ({
  onNavigateToPlayer,
}) => {
  
  // Audio state from Redux
  const currentTopic = useSelector(selectCurrentTopic);
  const isPlaying = useSelector(selectIsPlaying);
  const canPlay = useSelector(selectCanPlay);
  const hasNextTrack = useSelector(selectHasNextTrack);
  const hasPreviousTrack = useSelector(selectHasPreviousTrack);
  const progress = useSelector(selectPlaybackProgress);

  // Audio player actions
  const {
    togglePlayback,
    skipNext,
    skipPrevious,
  } = useAudioPlayer();

  // Mini player state management
  const {
    isVisible,
    hideMiniPlayer,
  } = useMiniPlayer();

  // Handle expand to full player
  const handleExpand = () => {
    if (onNavigateToPlayer) {
      onNavigateToPlayer();
    } else {
      // No default navigation in simplified setup
      console.log('Mini player expand pressed - no navigation handler provided');
    }
  };

  // Handle close mini player
  const handleClose = () => {
    hideMiniPlayer();
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    try {
      await togglePlayback();
    } catch (error) {
      console.error('Failed to toggle playback from mini player:', error);
    }
  };

  // Handle next track
  const handleNext = () => {
    try {
      skipNext();
    } catch (error) {
      console.error('Failed to skip to next track from mini player:', error);
    }
  };

  // Handle previous track
  const handlePrevious = () => {
    try {
      skipPrevious();
    } catch (error) {
      console.error('Failed to skip to previous track from mini player:', error);
    }
  };

  return (
    <MiniPlayer
      currentTopic={currentTopic}
      isPlaying={isPlaying}
      isVisible={isVisible}
      progress={progress}
      onPlayPause={handlePlayPause}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onExpand={handleExpand}
      onClose={handleClose}
      hasNextTrack={hasNextTrack}
      hasPreviousTrack={hasPreviousTrack}
      canPlay={canPlay}
    />
  );
};

export default MiniPlayerContainer;