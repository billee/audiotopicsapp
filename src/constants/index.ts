// App constants
export const STORAGE_KEYS = {
  PROGRESS: 'audio_progress',
  COMPLETED_TOPICS: 'completed_topics',
  CATEGORY_PREFERENCES: 'category_preferences',
  USER_SETTINGS: 'user_settings',
} as const;

export const AUDIO_CONFIG = {
  SEEK_INTERVAL: 15, // seconds
  VOLUME_STEP: 0.1,
  PROGRESS_UPDATE_INTERVAL: 1000, // milliseconds
  CACHE_SIZE_LIMIT: 500 * 1024 * 1024, // 500MB
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  LOADING_TIMEOUT: 10000,
} as const;