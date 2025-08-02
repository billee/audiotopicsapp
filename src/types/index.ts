// Core data models
export interface AudioTopic {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  audioUrl: string;
  duration: number;
  author?: string;
  publishDate?: string; // Changed from Date to string for Redux serialization
  thumbnailUrl?: string;
  metadata: {
    bitrate: number;
    format: string;
    size: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  backgroundImageUrl?: string;
  topicCount: number;
  color: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTopic: AudioTopic | null;
  currentPosition: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
}

export interface ProgressData {
  topicId: string;
  position: number;
  completed: boolean;
  lastPlayed: Date;
  playCount: number;
}

export interface CategoryPreferences {
  favoriteCategories: string[];
  recentlyViewed: string[];
  sortOrder: 'alphabetical' | 'recent' | 'popular';
}

// Re-export validation utilities
export * from '../utils/validation';

// Re-export data transformation utilities
export * from '../utils/dataTransform';