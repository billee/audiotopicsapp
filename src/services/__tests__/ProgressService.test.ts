/**
 * ProgressService tests
 */

import ProgressService from '../ProgressService';
import StorageService from '../StorageService';
import { AudioTopic } from '../../types';

// Mock StorageService
jest.mock('../StorageService');
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('ProgressService', () => {
  let progressService: ProgressService;
  let mockTopic: AudioTopic;

  beforeEach(() => {
    progressService = new ProgressService();
    mockTopic = {
      id: 'test-topic-1',
      title: 'Test Topic',
      description: 'Test Description',
      categoryId: 'test-category',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 300, // 5 minutes
      metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 5000000,
      },
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    progressService.stopProgressTracking();
  });

  describe('startProgressTracking', () => {
    it('should start tracking progress for a topic', () => {
      expect(() => {
        progressService.startProgressTracking(mockTopic);
      }).not.toThrow();
    });

    it('should stop existing tracking when starting new tracking', () => {
      const stopSpy = jest.spyOn(progressService, 'stopProgressTracking');
      
      progressService.startProgressTracking(mockTopic);
      progressService.startProgressTracking(mockTopic);
      
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('stopProgressTracking', () => {
    it('should stop progress tracking without errors', () => {
      progressService.startProgressTracking(mockTopic);
      
      expect(() => {
        progressService.stopProgressTracking();
      }).not.toThrow();
    });

    it('should handle stopping when not tracking', () => {
      expect(() => {
        progressService.stopProgressTracking();
      }).not.toThrow();
    });
  });

  describe('updateProgress', () => {
    beforeEach(() => {
      mockStorageService.saveProgress.mockResolvedValue();
      mockStorageService.markCompleted.mockResolvedValue();
    });

    it('should update progress when tracking is active', async () => {
      progressService.startProgressTracking(mockTopic);
      
      await progressService.updateProgress(150);
      
      expect(mockStorageService.saveProgress).toHaveBeenCalledWith(mockTopic.id, 150);
    });

    it('should not update progress when not tracking', async () => {
      await progressService.updateProgress(150);
      
      expect(mockStorageService.saveProgress).not.toHaveBeenCalled();
    });

    it('should not save progress for small position changes', async () => {
      progressService.startProgressTracking(mockTopic);
      
      // First update
      await progressService.updateProgress(15);
      expect(mockStorageService.saveProgress).toHaveBeenCalledTimes(1);
      
      // Small change - should not save
      await progressService.updateProgress(20);
      expect(mockStorageService.saveProgress).toHaveBeenCalledTimes(1);
      
      // Large change - should save
      await progressService.updateProgress(30);
      expect(mockStorageService.saveProgress).toHaveBeenCalledTimes(2);
    });

    it('should mark topic as completed when reaching completion threshold', async () => {
      progressService.startProgressTracking(mockTopic);
      
      // 95% of 300 seconds = 285 seconds
      await progressService.updateProgress(285);
      
      expect(mockStorageService.markCompleted).toHaveBeenCalledWith(mockTopic.id);
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageService.saveProgress.mockRejectedValue(new Error('Storage error'));
      progressService.startProgressTracking(mockTopic);
      
      // Should not throw error
      await expect(progressService.updateProgress(150)).resolves.toBeUndefined();
    });
  });

  describe('markCompleted', () => {
    it('should mark topic as completed', async () => {
      mockStorageService.markCompleted.mockResolvedValue();
      
      await progressService.markCompleted(mockTopic.id);
      
      expect(mockStorageService.markCompleted).toHaveBeenCalledWith(mockTopic.id);
    });

    it('should handle storage errors', async () => {
      mockStorageService.markCompleted.mockRejectedValue(new Error('Storage error'));
      
      await expect(progressService.markCompleted(mockTopic.id)).rejects.toThrow('Failed to mark topic test-topic-1 as completed');
    });
  });

  describe('getResumePosition', () => {
    it('should return resume position from storage', async () => {
      mockStorageService.getProgress.mockResolvedValue(150);
      
      const position = await progressService.getResumePosition(mockTopic.id);
      
      expect(position).toBe(150);
      expect(mockStorageService.getProgress).toHaveBeenCalledWith(mockTopic.id);
    });

    it('should return 0 on storage error', async () => {
      mockStorageService.getProgress.mockRejectedValue(new Error('Storage error'));
      
      const position = await progressService.getResumePosition(mockTopic.id);
      
      expect(position).toBe(0);
    });
  });

  describe('shouldShowResumeDialog', () => {
    it('should return true for topics with sufficient progress', async () => {
      mockStorageService.getProgressData.mockResolvedValue({
        topicId: mockTopic.id,
        position: 60, // Above 30 second threshold
        completed: false,
        lastPlayed: new Date(),
        playCount: 1,
      });
      
      const shouldShow = await progressService.shouldShowResumeDialog(mockTopic.id);
      
      expect(shouldShow).toBe(true);
    });

    it('should return false for completed topics', async () => {
      mockStorageService.getProgressData.mockResolvedValue({
        topicId: mockTopic.id,
        position: 150,
        completed: true,
        lastPlayed: new Date(),
        playCount: 1,
      });
      
      const shouldShow = await progressService.shouldShowResumeDialog(mockTopic.id);
      
      expect(shouldShow).toBe(false);
    });

    it('should return false for topics with insufficient progress', async () => {
      mockStorageService.getProgressData.mockResolvedValue({
        topicId: mockTopic.id,
        position: 15, // Below 30 second threshold
        completed: false,
        lastPlayed: new Date(),
        playCount: 1,
      });
      
      const shouldShow = await progressService.shouldShowResumeDialog(mockTopic.id);
      
      expect(shouldShow).toBe(false);
    });

    it('should return false when no progress data exists', async () => {
      mockStorageService.getProgressData.mockResolvedValue(null);
      
      const shouldShow = await progressService.shouldShowResumeDialog(mockTopic.id);
      
      expect(shouldShow).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageService.getProgressData.mockRejectedValue(new Error('Storage error'));
      
      const shouldShow = await progressService.shouldShowResumeDialog(mockTopic.id);
      
      expect(shouldShow).toBe(false);
    });
  });

  describe('getProgressStats', () => {
    it('should return progress statistics', async () => {
      const mockProgressData = [
        {
          topicId: 'topic1',
          position: 150,
          completed: true,
          lastPlayed: new Date(),
          playCount: 1,
        },
        {
          topicId: 'topic2',
          position: 75,
          completed: false,
          lastPlayed: new Date(),
          playCount: 1,
        },
      ];
      
      mockStorageService.getAllProgressData.mockResolvedValue(mockProgressData);
      mockStorageService.getCompletedTopics.mockResolvedValue(['topic1']);
      
      const stats = await progressService.getProgressStats();
      
      expect(stats).toEqual({
        totalTopicsStarted: 2,
        totalTopicsCompleted: 1,
        totalListeningTime: 225, // 150 + 75
        averageCompletionRate: 0.5, // 1 completed out of 2
      });
    });

    it('should handle empty progress data', async () => {
      mockStorageService.getAllProgressData.mockResolvedValue([]);
      mockStorageService.getCompletedTopics.mockResolvedValue([]);
      
      const stats = await progressService.getProgressStats();
      
      expect(stats).toEqual({
        totalTopicsStarted: 0,
        totalTopicsCompleted: 0,
        totalListeningTime: 0,
        averageCompletionRate: 0,
      });
    });

    it('should handle storage errors', async () => {
      mockStorageService.getAllProgressData.mockRejectedValue(new Error('Storage error'));
      
      const stats = await progressService.getProgressStats();
      
      expect(stats).toEqual({
        totalTopicsStarted: 0,
        totalTopicsCompleted: 0,
        totalListeningTime: 0,
        averageCompletionRate: 0,
      });
    });
  });
});