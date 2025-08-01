import { AudioTopic, Category, PlaybackState, ProgressData } from '../types';

// Data transformation utilities

// AudioTopic transformations
export const serializeAudioTopic = (topic: AudioTopic): string => {
  const serializable = {
    ...topic,
    publishDate: topic.publishDate?.toISOString(),
  };
  return JSON.stringify(serializable);
};

export const deserializeAudioTopic = (data: string): AudioTopic => {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    publishDate: parsed.publishDate ? new Date(parsed.publishDate) : undefined,
  };
};

// Category transformations
export const serializeCategory = (category: Category): string => {
  return JSON.stringify(category);
};

export const deserializeCategory = (data: string): Category => {
  return JSON.parse(data);
};

// PlaybackState transformations
export const serializePlaybackState = (state: PlaybackState): string => {
  const serializable = {
    ...state,
    currentTopic: state.currentTopic ? serializeAudioTopic(state.currentTopic) : null,
  };
  return JSON.stringify(serializable);
};

export const deserializePlaybackState = (data: string): PlaybackState => {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    currentTopic: parsed.currentTopic ? deserializeAudioTopic(parsed.currentTopic) : null,
  };
};

// ProgressData transformations
export const serializeProgressData = (progress: ProgressData): string => {
  const serializable = {
    ...progress,
    lastPlayed: progress.lastPlayed.toISOString(),
  };
  return JSON.stringify(serializable);
};

export const deserializeProgressData = (data: string): ProgressData => {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    lastPlayed: new Date(parsed.lastPlayed),
  };
};

// Array transformations
export const serializeAudioTopicArray = (topics: AudioTopic[]): string => {
  return JSON.stringify(topics.map(topic => ({
    ...topic,
    publishDate: topic.publishDate?.toISOString(),
  })));
};

export const deserializeAudioTopicArray = (data: string): AudioTopic[] => {
  const parsed = JSON.parse(data);
  return parsed.map((topic: any) => ({
    ...topic,
    publishDate: topic.publishDate ? new Date(topic.publishDate) : undefined,
  }));
};

export const serializeCategoryArray = (categories: Category[]): string => {
  return JSON.stringify(categories);
};

export const deserializeCategoryArray = (data: string): Category[] => {
  return JSON.parse(data);
};

export const serializeProgressDataArray = (progressList: ProgressData[]): string => {
  return JSON.stringify(progressList.map(progress => ({
    ...progress,
    lastPlayed: progress.lastPlayed.toISOString(),
  })));
};

export const deserializeProgressDataArray = (data: string): ProgressData[] => {
  const parsed = JSON.parse(data);
  return parsed.map((progress: any) => ({
    ...progress,
    lastPlayed: new Date(progress.lastPlayed),
  }));
};

// Utility functions for data manipulation
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateProgress = (currentPosition: number, duration: number): number => {
  if (duration === 0) return 0;
  return Math.min(Math.max(currentPosition / duration, 0), 1);
};

export const isTopicCompleted = (progress: ProgressData, duration: number = 300, completionThreshold: number = 0.95): boolean => {
  return progress.completed || (progress.position / duration) >= completionThreshold;
};

export const sortTopicsByProgress = (topics: AudioTopic[], progressData: ProgressData[]): AudioTopic[] => {
  const progressMap = new Map(progressData.map(p => [p.topicId, p]));
  
  return [...topics].sort((a, b) => {
    const progressA = progressMap.get(a.id);
    const progressB = progressMap.get(b.id);
    
    // Completed topics go to the end
    if (progressA?.completed && !progressB?.completed) return 1;
    if (!progressA?.completed && progressB?.completed) return -1;
    
    // Sort by last played date (most recent first)
    if (progressA?.lastPlayed && progressB?.lastPlayed) {
      return progressB.lastPlayed.getTime() - progressA.lastPlayed.getTime();
    }
    
    // Topics with progress come before those without
    if (progressA && !progressB) return -1;
    if (!progressA && progressB) return 1;
    
    // Default alphabetical sort
    return a.title.localeCompare(b.title);
  });
};

export const filterTopicsByCategory = (topics: AudioTopic[], categoryId: string): AudioTopic[] => {
  return topics.filter(topic => topic.categoryId === categoryId);
};

export const createDefaultPlaybackState = (): PlaybackState => ({
  isPlaying: false,
  currentTopic: null,
  currentPosition: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  isLoading: false,
  error: null,
});