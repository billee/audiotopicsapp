import {
  serializeAudioTopic,
  deserializeAudioTopic,
  serializeCategory,
  deserializeCategory,
  serializePlaybackState,
  deserializePlaybackState,
  serializeProgressData,
  deserializeProgressData,
  serializeAudioTopicArray,
  deserializeAudioTopicArray,
  serializeProgressDataArray,
  deserializeProgressDataArray,
  serializeCategoryArray,
  deserializeCategoryArray,
  formatDuration,
  calculateProgress,
  isTopicCompleted,
  sortTopicsByProgress,
  filterTopicsByCategory,
  createDefaultPlaybackState,
} from '../src/utils/dataTransform';
import { AudioTopic, Category, PlaybackState, ProgressData } from '../src/types';

describe('Data Transformation Utilities', () => {
  const mockAudioTopic: AudioTopic = {
    id: 'topic-1',
    title: 'Test Topic',
    description: 'A test audio topic',
    categoryId: 'cat-1',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 300,
    author: 'Test Author',
    publishDate: new Date('2023-01-01T10:00:00Z'),
    thumbnailUrl: 'https://example.com/thumb.jpg',
    metadata: {
      bitrate: 128,
      format: 'mp3',
      size: 5000000,
    },
  };

  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Test Category',
    description: 'A test category',
    iconUrl: 'https://example.com/icon.png',
    backgroundImageUrl: 'https://example.com/bg.jpg',
    topicCount: 5,
    color: '#FF0000',
  };

  const mockProgressData: ProgressData = {
    topicId: 'topic-1',
    position: 150,
    completed: false,
    lastPlayed: new Date('2023-01-01T10:00:00Z'),
    playCount: 3,
  };

  describe('AudioTopic serialization', () => {
    it('should serialize and deserialize AudioTopic correctly', () => {
      const serialized = serializeAudioTopic(mockAudioTopic);
      const deserialized = deserializeAudioTopic(serialized);
      
      expect(deserialized).toEqual(mockAudioTopic);
      expect(deserialized.publishDate).toBeInstanceOf(Date);
    });

    it('should handle AudioTopic without publishDate', () => {
      const topicWithoutDate = { ...mockAudioTopic, publishDate: undefined };
      const serialized = serializeAudioTopic(topicWithoutDate);
      const deserialized = deserializeAudioTopic(serialized);
      
      expect(deserialized.publishDate).toBeUndefined();
    });
  });

  describe('Category serialization', () => {
    it('should serialize and deserialize Category correctly', () => {
      const serialized = serializeCategory(mockCategory);
      const deserialized = deserializeCategory(serialized);
      
      expect(deserialized).toEqual(mockCategory);
    });
  });

  describe('PlaybackState serialization', () => {
    it('should serialize and deserialize PlaybackState correctly', () => {
      const mockPlaybackState: PlaybackState = {
        isPlaying: true,
        currentTopic: mockAudioTopic,
        currentPosition: 150,
        duration: 300,
        volume: 0.8,
        playbackRate: 1.0,
        isLoading: false,
        error: null,
      };

      const serialized = serializePlaybackState(mockPlaybackState);
      const deserialized = deserializePlaybackState(serialized);
      
      expect(deserialized.isPlaying).toBe(mockPlaybackState.isPlaying);
      expect(deserialized.currentTopic).toEqual(mockPlaybackState.currentTopic);
      expect(deserialized.currentPosition).toBe(mockPlaybackState.currentPosition);
    });

    it('should handle PlaybackState with null currentTopic', () => {
      const stateWithNullTopic: PlaybackState = {
        isPlaying: false,
        currentTopic: null,
        currentPosition: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        isLoading: false,
        error: null,
      };

      const serialized = serializePlaybackState(stateWithNullTopic);
      const deserialized = deserializePlaybackState(serialized);
      
      expect(deserialized.currentTopic).toBeNull();
    });
  });

  describe('ProgressData serialization', () => {
    it('should serialize and deserialize ProgressData correctly', () => {
      const serialized = serializeProgressData(mockProgressData);
      const deserialized = deserializeProgressData(serialized);
      
      expect(deserialized).toEqual(mockProgressData);
      expect(deserialized.lastPlayed).toBeInstanceOf(Date);
    });
  });

  describe('Array serialization', () => {
    it('should serialize and deserialize AudioTopic arrays correctly', () => {
      const topics = [mockAudioTopic, { ...mockAudioTopic, id: 'topic-2' }];
      const serialized = serializeAudioTopicArray(topics);
      const deserialized = deserializeAudioTopicArray(serialized);
      
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0]).toEqual(topics[0]);
      expect(deserialized[1]).toEqual(topics[1]);
    });

    it('should serialize and deserialize ProgressData arrays correctly', () => {
      const progressList = [mockProgressData, { ...mockProgressData, topicId: 'topic-2' }];
      const serialized = serializeProgressDataArray(progressList);
      const deserialized = deserializeProgressDataArray(serialized);
      
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0]).toEqual(progressList[0]);
      expect(deserialized[1]).toEqual(progressList[1]);
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly for minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(300)).toBe('5:00');
      expect(formatDuration(65)).toBe('1:05');
    });

    it('should format duration correctly for hours, minutes, and seconds', () => {
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(7200)).toBe('2:00:00');
      expect(formatDuration(3725)).toBe('1:02:05');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(59)).toBe('0:59');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(150, 300)).toBe(0.5);
      expect(calculateProgress(100, 200)).toBe(0.5);
      expect(calculateProgress(300, 300)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 300)).toBe(0);
      expect(calculateProgress(150, 0)).toBe(0);
      expect(calculateProgress(-50, 300)).toBe(0);
      expect(calculateProgress(400, 300)).toBe(1);
    });
  });

  describe('isTopicCompleted', () => {
    it('should return true for completed topics', () => {
      const completedProgress = { ...mockProgressData, completed: true };
      expect(isTopicCompleted(completedProgress)).toBe(true);
    });

    it('should return true for topics above completion threshold', () => {
      const nearCompleteProgress = { ...mockProgressData, position: 285 }; // 95% of 300
      expect(isTopicCompleted(nearCompleteProgress, 300, 0.95)).toBe(true);
    });

    it('should return false for incomplete topics', () => {
      expect(isTopicCompleted(mockProgressData, 300)).toBe(false);
    });
  });

  describe('sortTopicsByProgress', () => {
    const topics: AudioTopic[] = [
      { ...mockAudioTopic, id: 'topic-1', title: 'Topic A' },
      { ...mockAudioTopic, id: 'topic-2', title: 'Topic B' },
      { ...mockAudioTopic, id: 'topic-3', title: 'Topic C' },
    ];

    const progressData: ProgressData[] = [
      { ...mockProgressData, topicId: 'topic-1', completed: true, lastPlayed: new Date('2023-01-01') },
      { ...mockProgressData, topicId: 'topic-2', completed: false, lastPlayed: new Date('2023-01-02') },
    ];

    it('should sort topics with completed ones at the end', () => {
      const sorted = sortTopicsByProgress(topics, progressData);
      expect(sorted[sorted.length - 1].id).toBe('topic-1'); // completed topic at end
    });

    it('should sort by last played date for incomplete topics', () => {
      const sorted = sortTopicsByProgress(topics, progressData);
      expect(sorted[0].id).toBe('topic-2'); // most recently played incomplete topic first
    });
  });

  describe('filterTopicsByCategory', () => {
    const topics: AudioTopic[] = [
      { ...mockAudioTopic, id: 'topic-1', categoryId: 'cat-1' },
      { ...mockAudioTopic, id: 'topic-2', categoryId: 'cat-2' },
      { ...mockAudioTopic, id: 'topic-3', categoryId: 'cat-1' },
    ];

    it('should filter topics by category correctly', () => {
      const filtered = filterTopicsByCategory(topics, 'cat-1');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(topic => topic.categoryId === 'cat-1')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const filtered = filterTopicsByCategory(topics, 'non-existent');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('createDefaultPlaybackState', () => {
    it('should create correct default playback state', () => {
      const defaultState = createDefaultPlaybackState();
      
      expect(defaultState.isPlaying).toBe(false);
      expect(defaultState.currentTopic).toBeNull();
      expect(defaultState.currentPosition).toBe(0);
      expect(defaultState.duration).toBe(0);
      expect(defaultState.volume).toBe(1);
      expect(defaultState.playbackRate).toBe(1);
      expect(defaultState.isLoading).toBe(false);
      expect(defaultState.error).toBeNull();
    });
  });
});