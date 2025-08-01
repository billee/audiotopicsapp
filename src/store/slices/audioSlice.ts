/**
 * Audio slice for managing playback state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioTopic, PlaybackState } from '../../types';

interface AudioState extends PlaybackState {
  playlist: AudioTopic[];
  currentIndex: number;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
}

const initialState: AudioState = {
  isPlaying: false,
  currentTopic: null,
  currentPosition: 0,
  duration: 0,
  volume: 1.0,
  playbackRate: 1.0,
  isLoading: false,
  error: null,
  playlist: [],
  currentIndex: -1,
  repeatMode: 'none',
  shuffleMode: false,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setCurrentTopic: (state, action: PayloadAction<AudioTopic | null>) => {
      state.currentTopic = action.payload;
      state.error = null;
    },
    
    setPlaybackState: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    
    setCurrentPosition: (state, action: PayloadAction<number>) => {
      state.currentPosition = action.payload;
    },
    
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },
    
    setPlaylist: (state, action: PayloadAction<AudioTopic[]>) => {
      state.playlist = action.payload;
      state.currentIndex = action.payload.length > 0 ? 0 : -1;
    },
    
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.playlist.length) {
        state.currentIndex = action.payload;
        state.currentTopic = state.playlist[action.payload];
      }
    },
    
    nextTrack: (state) => {
      if (state.playlist.length === 0) return;
      
      let nextIndex = state.currentIndex + 1;
      
      if (state.repeatMode === 'one') {
        nextIndex = state.currentIndex;
      } else if (nextIndex >= state.playlist.length) {
        nextIndex = state.repeatMode === 'all' ? 0 : state.currentIndex;
      }
      
      if (nextIndex !== state.currentIndex) {
        state.currentIndex = nextIndex;
        state.currentTopic = state.playlist[nextIndex];
        state.currentPosition = 0;
      }
    },
    
    previousTrack: (state) => {
      if (state.playlist.length === 0) return;
      
      let prevIndex = state.currentIndex - 1;
      
      if (state.repeatMode === 'one') {
        prevIndex = state.currentIndex;
      } else if (prevIndex < 0) {
        prevIndex = state.repeatMode === 'all' ? state.playlist.length - 1 : 0;
      }
      
      if (prevIndex !== state.currentIndex) {
        state.currentIndex = prevIndex;
        state.currentTopic = state.playlist[prevIndex];
        state.currentPosition = 0;
      }
    },
    
    setRepeatMode: (state, action: PayloadAction<'none' | 'one' | 'all'>) => {
      state.repeatMode = action.payload;
    },
    
    setShuffleMode: (state, action: PayloadAction<boolean>) => {
      state.shuffleMode = action.payload;
    },
    
    resetPlayback: (state) => {
      state.isPlaying = false;
      state.currentTopic = null;
      state.currentPosition = 0;
      state.duration = 0;
      state.isLoading = false;
      state.error = null;
      state.playlist = [];
      state.currentIndex = -1;
    },
  },
});

export const {
  setCurrentTopic,
  setPlaybackState,
  setCurrentPosition,
  setDuration,
  setVolume,
  setPlaybackRate,
  setLoading,
  setError,
  setPlaylist,
  setCurrentIndex,
  nextTrack,
  previousTrack,
  setRepeatMode,
  setShuffleMode,
  resetPlayback,
} = audioSlice.actions;

export default audioSlice.reducer;