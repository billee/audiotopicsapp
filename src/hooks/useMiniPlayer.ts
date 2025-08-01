/**
 * Custom hook for managing mini player state and visibility
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import {
  selectCurrentTopic,
  selectIsPlaying,
  selectCanPlay,
  selectHasNextTrack,
  selectHasPreviousTrack,
  selectPlaybackProgress,
} from '../store/selectors/audioSelectors';

export interface UseMiniPlayerReturn {
  // State
  isVisible: boolean;
  shouldShowMiniPlayer: boolean;
  
  // Actions
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
  toggleMiniPlayer: () => void;
}

export const useMiniPlayer = (): UseMiniPlayerReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Audio state
  const currentTopic = useSelector(selectCurrentTopic);
  const isPlaying = useSelector(selectIsPlaying);
  const canPlay = useSelector(selectCanPlay);

  // Handle app state changes for background playback
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      
      // Show mini player when app goes to background and audio is playing
      if (nextAppState === 'background' && isPlaying && currentTopic) {
        setIsVisible(true);
      }
      
      // Hide mini player when app comes to foreground if full player is visible
      if (nextAppState === 'active' && isFullPlayerVisible) {
        setIsVisible(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [isPlaying, currentTopic, isFullPlayerVisible]);

  // Auto-show mini player when audio starts playing (and not in full player)
  useEffect(() => {
    if (isPlaying && currentTopic && !isFullPlayerVisible && appState === 'active') {
      setIsVisible(true);
    }
  }, [isPlaying, currentTopic, isFullPlayerVisible, appState]);

  // Auto-hide mini player when audio stops or no current topic
  useEffect(() => {
    if (!currentTopic || (!isPlaying && !canPlay)) {
      setIsVisible(false);
    }
  }, [currentTopic, isPlaying, canPlay]);

  const showMiniPlayer = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideMiniPlayer = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleMiniPlayer = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Determine if mini player should be shown
  const shouldShowMiniPlayer = Boolean(
    currentTopic && 
    (isPlaying || canPlay) && 
    !isFullPlayerVisible
  );

  // Provide method to set full player visibility (to be called from navigation)
  const setFullPlayerVisibility = useCallback((visible: boolean) => {
    setIsFullPlayerVisible(visible);
    if (visible) {
      setIsVisible(false);
    }
  }, []);

  return {
    // State
    isVisible: isVisible && shouldShowMiniPlayer,
    shouldShowMiniPlayer,
    
    // Actions
    showMiniPlayer,
    hideMiniPlayer,
    toggleMiniPlayer,
    
    // Internal method for navigation integration
    setFullPlayerVisibility,
  } as UseMiniPlayerReturn & { setFullPlayerVisibility: (visible: boolean) => void };
};