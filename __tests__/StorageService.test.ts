import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../src/services/StorageService';
import { ProgressData, CategoryPreferences } from '../src/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.removeItem.mockResolvedValue();
    mockAsyncStorage.multiRemove.mockResolvedValue();
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
  });

  describe('initialize', () => {
    it('should initialize successfully for new installation', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // No stored version
      
      await StorageService.initialize();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app_version', '1.0.0');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'category_preferences',
        JSON.stringify({
          favoriteCategories: [],
          recentlyViewed: [],
          sortOrder: 'alphabetical',
        })
      );
    });

    it('should handle migration for existing installation', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('0.9.0'); // Old version
      
      await StorageService.initialize();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('app_version', '1.0.0');
    });

    it('should handle initialization errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(StorageService.initialize()).rejects.toThrow('Failed to initialize storage service');
    });
  });

  describe('saveProgress', () => {
    it('should save progress for new topic', async () => {
      const topicId = 'topic-1';
      const position = 120;
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // No existing progress
      
      await StorageService.saveProgress(topicId, position);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'audio_progress_topic-1',
        expect.stringContaining('"position":120')
      );
    });

    it('should update progress for existing topic', async () => {
      const topicId = 'topic-1';
      const position = 180;
      const existingProgress: ProgressData = {
        topicId,
        position: 120,
        completed: false,
        lastPlayed: new Date('2023-01-01'),
        playCount: 2,
      };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingProgress));
      
      await StorageService.saveProgress(topicId, position);
      
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData.position).toBe(180);
      expect(savedData.playCount).toBe(3);
    });

    it('should handle save progress errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(StorageService.saveProgress('topic-1', 120)).rejects.toThrow(
        'Failed to save progress for topic topic-1'
      );
    });
  });

  describe('getProgress', () => {
    it('should return progress for existing topic', async () => {
      const progressData: ProgressData = {
        topicId: 'topic-1',
        position: 150,
        completed: false,
        lastPlayed: new Date(),
        playCount: 1,
      };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(progressData));
      
      const progress = await StorageService.getProgress('topic-1');
      
      expect(progress).toBe(150);
    });

    it('should return 0 for non-existing topic', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const progress = await StorageService.getProgress('topic-1');
      
      expect(progress).toBe(0);
    });

    it('should handle get progress errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const progress = await StorageService.getProgress('topic-1');
      
      expect(progress).toBe(0);
    });
  });

  describe('getProgressData', () => {
    it('should return complete progress data', async () => {
      const progressData: ProgressData = {
        topicId: 'topic-1',
        position: 150,
        completed: false,
        lastPlayed: new Date('2023-01-01T10:00:00Z'),
        playCount: 1,
      };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(progressData));
      
      const result = await StorageService.getProgressData('topic-1');
      
      expect(result).toEqual({
        ...progressData,
        lastPlayed: new Date('2023-01-01T10:00:00Z'),
      });
    });

    it('should return null for non-existing topic', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await StorageService.getProgressData('topic-1');
      
      expect(result).toBeNull();
    });
  });

  describe('markCompleted', () => {
    it('should mark topic as completed', async () => {
      const existingProgress: ProgressData = {
        topicId: 'topic-1',
        position: 150,
        completed: false,
        lastPlayed: new Date(),
        playCount: 1,
      };
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(existingProgress)) // getProgressData call
        .mockResolvedValueOnce(JSON.stringify([])); // getCompletedTopics call
      
      await StorageService.markCompleted('topic-1');
      
      // Check that progress was updated with completed: true
      const progressCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === 'audio_progress_topic-1'
      );
      expect(progressCall).toBeDefined();
      const savedProgress = JSON.parse(progressCall![1]);
      expect(savedProgress.completed).toBe(true);
      
      // Check that topic was added to completed list
      const completedCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === 'completed_topics'
      );
      expect(completedCall).toBeDefined();
      const completedTopics = JSON.parse(completedCall![1]);
      expect(completedTopics).toContain('topic-1');
    });

    it('should not duplicate completed topics', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // getProgressData call
        .mockResolvedValueOnce(JSON.stringify(['topic-1'])); // getCompletedTopics call
      
      await StorageService.markCompleted('topic-1');
      
      // Should not add duplicate to completed topics
      const completedCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === 'completed_topics'
      );
      expect(completedCall).toBeUndefined();
    });
  });

  describe('getCompletedTopics', () => {
    it('should return completed topics list', async () => {
      const completedTopics = ['topic-1', 'topic-2'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(completedTopics));
      
      const result = await StorageService.getCompletedTopics();
      
      expect(result).toEqual(completedTopics);
    });

    it('should return empty array for no completed topics', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await StorageService.getCompletedTopics();
      
      expect(result).toEqual([]);
    });
  });

  describe('saveCategoryPreferences', () => {
    it('should save category preferences', async () => {
      const preferences: CategoryPreferences = {
        favoriteCategories: ['cat-1', 'cat-2'],
        recentlyViewed: ['cat-3'],
        sortOrder: 'recent',
      };
      
      await StorageService.saveCategoryPreferences(preferences);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'category_preferences',
        JSON.stringify(preferences)
      );
    });

    it('should handle save preferences errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(StorageService.saveCategoryPreferences({
        favoriteCategories: [],
        recentlyViewed: [],
        sortOrder: 'alphabetical',
      })).rejects.toThrow('Failed to save category preferences');
    });
  });

  describe('getCategoryPreferences', () => {
    it('should return saved preferences', async () => {
      const preferences: CategoryPreferences = {
        favoriteCategories: ['cat-1'],
        recentlyViewed: ['cat-2'],
        sortOrder: 'popular',
      };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(preferences));
      
      const result = await StorageService.getCategoryPreferences();
      
      expect(result).toEqual(preferences);
    });

    it('should return default preferences when none exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await StorageService.getCategoryPreferences();
      
      expect(result).toEqual({
        favoriteCategories: [],
        recentlyViewed: [],
        sortOrder: 'alphabetical',
      });
    });

    it('should return default preferences on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await StorageService.getCategoryPreferences();
      
      expect(result).toEqual({
        favoriteCategories: [],
        recentlyViewed: [],
        sortOrder: 'alphabetical',
      });
    });
  });

  describe('getAllProgressData', () => {
    it('should return all progress data', async () => {
      const keys = ['audio_progress_topic-1', 'audio_progress_topic-2', 'other_key'];
      const progressData1: ProgressData = {
        topicId: 'topic-1',
        position: 100,
        completed: false,
        lastPlayed: new Date('2023-01-01'),
        playCount: 1,
      };
      const progressData2: ProgressData = {
        topicId: 'topic-2',
        position: 200,
        completed: true,
        lastPlayed: new Date('2023-01-02'),
        playCount: 2,
      };
      
      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(keys);
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(progressData1))
        .mockResolvedValueOnce(JSON.stringify(progressData2));
      
      const result = await StorageService.getAllProgressData();
      
      expect(result).toHaveLength(2);
      expect(result[0].topicId).toBe('topic-1');
      expect(result[1].topicId).toBe('topic-2');
    });

    it('should handle errors gracefully', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await StorageService.getAllProgressData();
      
      expect(result).toEqual([]);
    });
  });

  describe('clearAllProgress', () => {
    it('should clear all progress data', async () => {
      const keys = ['audio_progress_topic-1', 'audio_progress_topic-2', 'completed_topics', 'other_key'];
      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(keys);
      
      await StorageService.clearAllProgress();
      
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'audio_progress_topic-1',
        'audio_progress_topic-2',
        'completed_topics',
      ]);
    });

    it('should handle clear errors', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(StorageService.clearAllProgress()).rejects.toThrow('Failed to clear progress data');
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const keys = ['audio_progress_topic-1', 'audio_progress_topic-2', 'other_key'];
      const completedTopics = ['topic-1'];
      
      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(keys);
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(completedTopics));
      
      const stats = await StorageService.getStorageStats();
      
      expect(stats).toEqual({
        totalKeys: 3,
        progressEntries: 2,
        completedTopics: 1,
      });
    });

    it('should handle stats errors gracefully', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));
      
      const stats = await StorageService.getStorageStats();
      
      expect(stats).toEqual({
        totalKeys: 0,
        progressEntries: 0,
        completedTopics: 0,
      });
    });
  });
});