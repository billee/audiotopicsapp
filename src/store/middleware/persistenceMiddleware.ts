/**
 * Middleware for persisting critical state to storage
 */

import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import StorageService from '../../services/StorageService';

// Actions that should trigger persistence
const PERSISTENCE_ACTIONS = [
  // Audio state
  'audio/setCurrentPosition',
  'audio/setCurrentTopic',
  'audio/setVolume',
  'audio/setPlaybackRate',
  'audio/setRepeatMode',
  'audio/setShuffleMode',
  
  // User preferences
  'userPreferences/updateProgress',
  'userPreferences/markTopicCompleted',
  'userPreferences/addFavoriteCategory',
  'userPreferences/removeFavoriteCategory',
  'userPreferences/addRecentlyViewedCategory',
  'userPreferences/setCategorySortOrder',
  'userPreferences/setTheme',
  'userPreferences/setAutoPlay',
  'userPreferences/setDownloadQuality',
  'userPreferences/setBackgroundPlayback',
  'userPreferences/setSkipSilence',
  'userPreferences/setSleepTimer',
  'userPreferences/updateAppSettings',
];

// Debounce function to prevent excessive storage writes
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

class PersistenceManager {
  private storageService: StorageService;
  private debouncedPersist: (state: RootState) => void;

  constructor() {
    this.storageService = new StorageService();
    this.debouncedPersist = debounce(this.persistState.bind(this), 1000);
  }

  private async persistState(state: RootState): Promise<void> {
    try {
      // Persist audio state (only critical parts)
      const audioStateToPersist = {
        currentPosition: state.audio.currentPosition,
        volume: state.audio.volume,
        playbackRate: state.audio.playbackRate,
        repeatMode: state.audio.repeatMode,
        shuffleMode: state.audio.shuffleMode,
        currentTopic: state.audio.currentTopic,
      };
      
      await this.storageService.saveData('audioState', audioStateToPersist);

      // Persist user preferences
      await this.storageService.saveData('userPreferences', state.userPreferences);

      // Update last sync time
      await this.storageService.saveData('lastPersistTime', Date.now());
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  async loadPersistedState(): Promise<Partial<RootState> | null> {
    try {
      const [audioState, userPreferences] = await Promise.all([
        this.storageService.getData('audioState'),
        this.storageService.getData('userPreferences'),
      ]);

      const persistedState: Partial<RootState> = {};

      if (audioState) {
        persistedState.audio = {
          // Default audio state
          isPlaying: false,
          duration: 0,
          isLoading: false,
          error: null,
          playlist: [],
          currentIndex: -1,
          // Persisted values
          ...audioState,
        };
      }

      if (userPreferences) {
        persistedState.userPreferences = userPreferences;
      }

      return Object.keys(persistedState).length > 0 ? persistedState : null;
    } catch (error) {
      console.error('Failed to load persisted state:', error);
      return null;
    }
  }

  shouldPersist(actionType: string): boolean {
    return PERSISTENCE_ACTIONS.includes(actionType);
  }

  triggerPersistence(state: RootState): void {
    this.debouncedPersist(state);
  }
}

const persistenceManager = new PersistenceManager();

export const persistenceMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    const result = next(action);
    
    // Check if this action should trigger persistence
    if (persistenceManager.shouldPersist(action.type)) {
      const state = store.getState();
      persistenceManager.triggerPersistence(state);
    }
    
    return result;
  };

export { persistenceManager };