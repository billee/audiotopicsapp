/**
 * Audio selectors for efficient state access
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Basic selectors
export const selectAudioState = (state: RootState) => state.audio;
export const selectCurrentTopic = (state: RootState) => state.audio.currentTopic;
export const selectIsPlaying = (state: RootState) => state.audio.isPlaying;
export const selectCurrentPosition = (state: RootState) => state.audio.currentPosition;
export const selectDuration = (state: RootState) => state.audio.duration;
export const selectVolume = (state: RootState) => state.audio.volume;
export const selectPlaybackRate = (state: RootState) => state.audio.playbackRate;
export const selectIsLoading = (state: RootState) => state.audio.isLoading;
export const selectAudioError = (state: RootState) => state.audio.error;
export const selectPlaylist = (state: RootState) => state.audio.playlist;
export const selectCurrentIndex = (state: RootState) => state.audio.currentIndex;
export const selectRepeatMode = (state: RootState) => state.audio.repeatMode;
export const selectShuffleMode = (state: RootState) => state.audio.shuffleMode;

// Computed selectors
export const selectPlaybackProgress = createSelector(
  [selectCurrentPosition, selectDuration],
  (position, duration) => {
    if (duration === 0) return 0;
    return Math.min(position / duration, 1);
  }
);

export const selectFormattedCurrentTime = createSelector(
  [selectCurrentPosition],
  (position) => {
    const minutes = Math.floor(position / 60);
    const seconds = Math.floor(position % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
);

export const selectFormattedDuration = createSelector(
  [selectDuration],
  (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
);

export const selectRemainingTime = createSelector(
  [selectCurrentPosition, selectDuration],
  (position, duration) => {
    return Math.max(0, duration - position);
  }
);

export const selectFormattedRemainingTime = createSelector(
  [selectRemainingTime],
  (remaining) => {
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `-${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
);

export const selectHasNextTrack = createSelector(
  [selectCurrentIndex, selectPlaylist, selectRepeatMode],
  (currentIndex, playlist, repeatMode) => {
    if (playlist.length === 0) return false;
    if (repeatMode === 'one' || repeatMode === 'all') return true;
    return currentIndex < playlist.length - 1;
  }
);

export const selectHasPreviousTrack = createSelector(
  [selectCurrentIndex, selectPlaylist, selectRepeatMode],
  (currentIndex, playlist, repeatMode) => {
    if (playlist.length === 0) return false;
    if (repeatMode === 'one' || repeatMode === 'all') return true;
    return currentIndex > 0;
  }
);

export const selectNextTrack = createSelector(
  [selectCurrentIndex, selectPlaylist],
  (currentIndex, playlist) => {
    if (playlist.length === 0 || currentIndex >= playlist.length - 1) return null;
    return playlist[currentIndex + 1];
  }
);

export const selectPreviousTrack = createSelector(
  [selectCurrentIndex, selectPlaylist],
  (currentIndex, playlist) => {
    if (playlist.length === 0 || currentIndex <= 0) return null;
    return playlist[currentIndex - 1];
  }
);

export const selectIsPlaylistEmpty = createSelector(
  [selectPlaylist],
  (playlist) => playlist.length === 0
);

export const selectPlaylistDuration = createSelector(
  [selectPlaylist],
  (playlist) => {
    return playlist.reduce((total, topic) => total + topic.duration, 0);
  }
);

export const selectCurrentTopicIndex = createSelector(
  [selectCurrentTopic, selectPlaylist],
  (currentTopic, playlist) => {
    if (!currentTopic) return -1;
    return playlist.findIndex(topic => topic.id === currentTopic.id);
  }
);

export const selectCanPlay = createSelector(
  [selectCurrentTopic, selectIsLoading, selectAudioError],
  (currentTopic, isLoading, error) => {
    return currentTopic !== null && !isLoading && !error;
  }
);