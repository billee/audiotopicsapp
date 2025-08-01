import { AudioTopic, Category, PlaybackState, ProgressData } from '../types';

// Validation utility functions
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidColor = (color: string): boolean => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
};

// AudioTopic validation
export const validateAudioTopic = (topic: any): topic is AudioTopic => {
  if (!topic || typeof topic !== 'object') return false;
  
  // Required fields
  if (typeof topic.id !== 'string' || topic.id.trim() === '') return false;
  if (typeof topic.title !== 'string' || topic.title.trim() === '') return false;
  if (typeof topic.description !== 'string') return false;
  if (typeof topic.categoryId !== 'string' || topic.categoryId.trim() === '') return false;
  if (typeof topic.audioUrl !== 'string' || !isValidUrl(topic.audioUrl)) return false;
  if (typeof topic.duration !== 'number' || topic.duration < 0) return false;
  
  // Optional fields
  if (topic.author !== undefined && typeof topic.author !== 'string') return false;
  if (topic.publishDate !== undefined && !isValidDate(topic.publishDate)) return false;
  if (topic.thumbnailUrl !== undefined && (typeof topic.thumbnailUrl !== 'string' || !isValidUrl(topic.thumbnailUrl))) return false;
  
  // Metadata validation
  if (!topic.metadata || typeof topic.metadata !== 'object') return false;
  if (typeof topic.metadata.bitrate !== 'number' || topic.metadata.bitrate <= 0) return false;
  if (typeof topic.metadata.format !== 'string' || topic.metadata.format.trim() === '') return false;
  if (typeof topic.metadata.size !== 'number' || topic.metadata.size < 0) return false;
  
  return true;
};

// Category validation
export const validateCategory = (category: any): category is Category => {
  if (!category || typeof category !== 'object') return false;
  
  // Required fields
  if (typeof category.id !== 'string' || category.id.trim() === '') return false;
  if (typeof category.name !== 'string' || category.name.trim() === '') return false;
  if (typeof category.description !== 'string') return false;
  if (typeof category.topicCount !== 'number' || category.topicCount < 0) return false;
  if (typeof category.color !== 'string' || !isValidColor(category.color)) return false;
  
  // Optional fields
  if (category.iconUrl !== undefined && (typeof category.iconUrl !== 'string' || !isValidUrl(category.iconUrl))) return false;
  if (category.backgroundImageUrl !== undefined && (typeof category.backgroundImageUrl !== 'string' || !isValidUrl(category.backgroundImageUrl))) return false;
  
  return true;
};

// PlaybackState validation
export const validatePlaybackState = (state: any): state is PlaybackState => {
  if (!state || typeof state !== 'object') return false;
  
  if (typeof state.isPlaying !== 'boolean') return false;
  if (state.currentTopic !== null && !validateAudioTopic(state.currentTopic)) return false;
  if (typeof state.currentPosition !== 'number' || state.currentPosition < 0) return false;
  if (typeof state.duration !== 'number' || state.duration < 0) return false;
  if (typeof state.volume !== 'number' || state.volume < 0 || state.volume > 1) return false;
  if (typeof state.playbackRate !== 'number' || state.playbackRate <= 0) return false;
  if (typeof state.isLoading !== 'boolean') return false;
  if (state.error !== null && typeof state.error !== 'string') return false;
  
  return true;
};

// ProgressData validation
export const validateProgressData = (progress: any): progress is ProgressData => {
  if (!progress || typeof progress !== 'object') return false;
  
  if (typeof progress.topicId !== 'string' || progress.topicId.trim() === '') return false;
  if (typeof progress.position !== 'number' || progress.position < 0) return false;
  if (typeof progress.completed !== 'boolean') return false;
  if (!isValidDate(progress.lastPlayed)) return false;
  if (typeof progress.playCount !== 'number' || progress.playCount < 0) return false;
  
  return true;
};