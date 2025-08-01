import {
  validateAudioTopic,
  validateCategory,
  validatePlaybackState,
  validateProgressData,
  isValidUrl,
  isValidDate,
  isValidColor,
} from '../src/utils/validation';
import { AudioTopic, Category, PlaybackState, ProgressData } from '../src/types';

describe('Validation Utilities', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/audio.mp3')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('ftp://invalid')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2023-01-01'))).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('2023-01-01')).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('isValidColor', () => {
    it('should validate correct hex colors', () => {
      expect(isValidColor('#FF0000')).toBe(true);
      expect(isValidColor('#fff')).toBe(true);
      expect(isValidColor('#123ABC')).toBe(true);
    });

    it('should reject invalid colors', () => {
      expect(isValidColor('red')).toBe(false);
      expect(isValidColor('#GG0000')).toBe(false);
      expect(isValidColor('FF0000')).toBe(false);
      expect(isValidColor('#FF00')).toBe(false);
    });
  });

  describe('validateAudioTopic', () => {
    const validAudioTopic: AudioTopic = {
      id: 'topic-1',
      title: 'Test Topic',
      description: 'A test audio topic',
      categoryId: 'cat-1',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 300,
      author: 'Test Author',
      publishDate: new Date('2023-01-01'),
      thumbnailUrl: 'https://example.com/thumb.jpg',
      metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 5000000,
      },
    };

    it('should validate a correct AudioTopic', () => {
      expect(validateAudioTopic(validAudioTopic)).toBe(true);
    });

    it('should validate AudioTopic without optional fields', () => {
      const minimalTopic = {
        id: 'topic-1',
        title: 'Test Topic',
        description: 'A test audio topic',
        categoryId: 'cat-1',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 300,
        metadata: {
          bitrate: 128,
          format: 'mp3',
          size: 5000000,
        },
      };
      expect(validateAudioTopic(minimalTopic)).toBe(true);
    });

    it('should reject AudioTopic with missing required fields', () => {
      expect(validateAudioTopic({ ...validAudioTopic, id: '' })).toBe(false);
      expect(validateAudioTopic({ ...validAudioTopic, title: '' })).toBe(false);
      expect(validateAudioTopic({ ...validAudioTopic, categoryId: '' })).toBe(false);
      expect(validateAudioTopic({ ...validAudioTopic, audioUrl: 'invalid-url' })).toBe(false);
      expect(validateAudioTopic({ ...validAudioTopic, duration: -1 })).toBe(false);
    });

    it('should reject AudioTopic with invalid metadata', () => {
      expect(validateAudioTopic({ 
        ...validAudioTopic, 
        metadata: { ...validAudioTopic.metadata, bitrate: -1 } 
      })).toBe(false);
      expect(validateAudioTopic({ 
        ...validAudioTopic, 
        metadata: { ...validAudioTopic.metadata, format: '' } 
      })).toBe(false);
      expect(validateAudioTopic({ 
        ...validAudioTopic, 
        metadata: { ...validAudioTopic.metadata, size: -1 } 
      })).toBe(false);
    });

    it('should reject non-object input', () => {
      expect(validateAudioTopic(null)).toBe(false);
      expect(validateAudioTopic(undefined)).toBe(false);
      expect(validateAudioTopic('string')).toBe(false);
      expect(validateAudioTopic(123)).toBe(false);
    });
  });

  describe('validateCategory', () => {
    const validCategory: Category = {
      id: 'cat-1',
      name: 'Test Category',
      description: 'A test category',
      iconUrl: 'https://example.com/icon.png',
      backgroundImageUrl: 'https://example.com/bg.jpg',
      topicCount: 5,
      color: '#FF0000',
    };

    it('should validate a correct Category', () => {
      expect(validateCategory(validCategory)).toBe(true);
    });

    it('should validate Category without optional fields', () => {
      const minimalCategory = {
        id: 'cat-1',
        name: 'Test Category',
        description: 'A test category',
        topicCount: 5,
        color: '#FF0000',
      };
      expect(validateCategory(minimalCategory)).toBe(true);
    });

    it('should reject Category with missing required fields', () => {
      expect(validateCategory({ ...validCategory, id: '' })).toBe(false);
      expect(validateCategory({ ...validCategory, name: '' })).toBe(false);
      expect(validateCategory({ ...validCategory, topicCount: -1 })).toBe(false);
      expect(validateCategory({ ...validCategory, color: 'invalid-color' })).toBe(false);
    });

    it('should reject Category with invalid optional URLs', () => {
      expect(validateCategory({ ...validCategory, iconUrl: 'invalid-url' })).toBe(false);
      expect(validateCategory({ ...validCategory, backgroundImageUrl: 'invalid-url' })).toBe(false);
    });
  });

  describe('validatePlaybackState', () => {
    const validPlaybackState: PlaybackState = {
      isPlaying: true,
      currentTopic: null,
      currentPosition: 150,
      duration: 300,
      volume: 0.8,
      playbackRate: 1.0,
      isLoading: false,
      error: null,
    };

    it('should validate a correct PlaybackState', () => {
      expect(validatePlaybackState(validPlaybackState)).toBe(true);
    });

    it('should reject PlaybackState with invalid values', () => {
      expect(validatePlaybackState({ ...validPlaybackState, currentPosition: -1 })).toBe(false);
      expect(validatePlaybackState({ ...validPlaybackState, duration: -1 })).toBe(false);
      expect(validatePlaybackState({ ...validPlaybackState, volume: -0.1 })).toBe(false);
      expect(validatePlaybackState({ ...validPlaybackState, volume: 1.1 })).toBe(false);
      expect(validatePlaybackState({ ...validPlaybackState, playbackRate: 0 })).toBe(false);
      expect(validatePlaybackState({ ...validPlaybackState, playbackRate: -1 })).toBe(false);
    });
  });

  describe('validateProgressData', () => {
    const validProgressData: ProgressData = {
      topicId: 'topic-1',
      position: 150,
      completed: false,
      lastPlayed: new Date('2023-01-01'),
      playCount: 3,
    };

    it('should validate a correct ProgressData', () => {
      expect(validateProgressData(validProgressData)).toBe(true);
    });

    it('should reject ProgressData with invalid values', () => {
      expect(validateProgressData({ ...validProgressData, topicId: '' })).toBe(false);
      expect(validateProgressData({ ...validProgressData, position: -1 })).toBe(false);
      expect(validateProgressData({ ...validProgressData, lastPlayed: 'invalid-date' })).toBe(false);
      expect(validateProgressData({ ...validProgressData, playCount: -1 })).toBe(false);
    });
  });
});