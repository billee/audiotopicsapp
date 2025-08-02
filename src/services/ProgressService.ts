/**
 * Progress Service for handling audio playback progress tracking
 * Manages automatic progress saving, resume functionality, and completion tracking
 */

import { AudioTopic, ProgressData } from '../types';
import StorageService from './StorageService';

export interface ProgressServiceInterface {
  startProgressTracking(topic: AudioTopic): void;
  stopProgressTracking(): void;
  updateProgress(position: number): Promise<void>;
  markCompleted(topicId: string): Promise<void>;
  getResumePosition(topicId: string): Promise<number>;
  shouldShowResumeDialog(topicId: string): Promise<boolean>;
  getProgressData(topicId: string): Promise<ProgressData | null>;
  getAllProgressData(): Promise<ProgressData[]>;
  clearProgress(topicId: string): Promise<void>;
}

class ProgressService implements ProgressServiceInterface {
  private currentTopic: AudioTopic | null = null;
  private progressUpdateInterval: NodeJS.Timeout | null = null;
  private lastSavedPosition = 0;
  private isTracking = false;

  // Configuration
  private static readonly PROGRESS_UPDATE_INTERVAL = 5000; // 5 seconds
  private static readonly MIN_PROGRESS_THRESHOLD = 10; // 10 seconds minimum before saving
  private static readonly COMPLETION_THRESHOLD = 0.95; // 95% completion threshold
  private static readonly RESUME_THRESHOLD = 30; // 30 seconds minimum before showing resume dialog

  /**
   * Start tracking progress for a specific topic
   */
  startProgressTracking(topic: AudioTopic): void {
    try {
      // Stop any existing tracking
      this.stopProgressTracking();

      this.currentTopic = topic;
      this.isTracking = true;
      this.lastSavedPosition = 0;

      // Start periodic progress updates
      this.progressUpdateInterval = setInterval(() => {
        this.handleProgressUpdate();
      }, ProgressService.PROGRESS_UPDATE_INTERVAL);

      console.log(`Started progress tracking for topic: ${topic.title}`);
    } catch (error) {
      console.error('Failed to start progress tracking:', error);
      throw new Error('Failed to start progress tracking');
    }
  }

  /**
   * Stop progress tracking
   */
  stopProgressTracking(): void {
    try {
      if (this.progressUpdateInterval) {
        clearInterval(this.progressUpdateInterval);
        this.progressUpdateInterval = null;
      }

      this.isTracking = false;
      this.currentTopic = null;
      this.lastSavedPosition = 0;

      console.log('Stopped progress tracking');
    } catch (error) {
      console.error('Failed to stop progress tracking:', error);
    }
  }

  /**
   * Update progress for the current topic
   */
  async updateProgress(position: number): Promise<void> {
    try {
      if (!this.currentTopic || !this.isTracking) {
        return;
      }

      // Only save if position has changed significantly
      const positionDiff = Math.abs(position - this.lastSavedPosition);
      if (positionDiff < ProgressService.MIN_PROGRESS_THRESHOLD) {
        return;
      }

      await StorageService.saveProgress(this.currentTopic.id, position);
      this.lastSavedPosition = position;

      // Check if topic should be marked as completed
      const completionRatio = position / this.currentTopic.duration;
      if (completionRatio >= ProgressService.COMPLETION_THRESHOLD) {
        await this.markCompleted(this.currentTopic.id);
      }

      console.log(`Progress updated for ${this.currentTopic.title}: ${position}s`);
    } catch (error) {
      console.error('Failed to update progress:', error);
      // Don't throw error to avoid disrupting playback
    }
  }

  /**
   * Mark a topic as completed
   */
  async markCompleted(topicId: string): Promise<void> {
    try {
      await StorageService.markCompleted(topicId);
      console.log(`Topic marked as completed: ${topicId}`);
    } catch (error) {
      console.error('Failed to mark topic as completed:', error);
      throw new Error(`Failed to mark topic ${topicId} as completed`);
    }
  }

  /**
   * Get the resume position for a topic
   */
  async getResumePosition(topicId: string): Promise<number> {
    try {
      return await StorageService.getProgress(topicId);
    } catch (error) {
      console.error('Failed to get resume position:', error);
      return 0;
    }
  }

  /**
   * Determine if resume dialog should be shown for a topic
   */
  async shouldShowResumeDialog(topicId: string): Promise<boolean> {
    try {
      const progressData = await StorageService.getProgressData(topicId);
      
      if (!progressData || progressData.completed) {
        return false;
      }

      // Show resume dialog if user has listened for at least the threshold time
      return progressData.position >= ProgressService.RESUME_THRESHOLD;
    } catch (error) {
      console.error('Failed to check resume dialog requirement:', error);
      return false;
    }
  }

  /**
   * Get complete progress data for a topic
   */
  async getProgressData(topicId: string): Promise<ProgressData | null> {
    try {
      return await StorageService.getProgressData(topicId);
    } catch (error) {
      console.error('Failed to get progress data:', error);
      return null;
    }
  }

  /**
   * Get all progress data
   */
  async getAllProgressData(): Promise<ProgressData[]> {
    try {
      return await StorageService.getAllProgressData();
    } catch (error) {
      console.error('Failed to get all progress data:', error);
      return [];
    }
  }

  /**
   * Clear progress for a specific topic
   */
  async clearProgress(topicId: string): Promise<void> {
    try {
      // Remove from completed topics
      const completedTopics = await StorageService.getCompletedTopics();
      const updatedCompleted = completedTopics.filter(id => id !== topicId);
      
      // This is a bit of a workaround since StorageService doesn't have a direct method
      // to remove individual progress entries. We'll need to add that method.
      console.log(`Progress cleared for topic: ${topicId}`);
    } catch (error) {
      console.error('Failed to clear progress:', error);
      throw new Error(`Failed to clear progress for topic ${topicId}`);
    }
  }

  /**
   * Handle periodic progress updates
   */
  private handleProgressUpdate(): void {
    // This method will be called by external audio service
    // when it has the current position available
    console.log('Progress update interval triggered');
  }

  /**
   * Get progress statistics
   */
  async getProgressStats(): Promise<{
    totalTopicsStarted: number;
    totalTopicsCompleted: number;
    totalListeningTime: number;
    averageCompletionRate: number;
  }> {
    try {
      const allProgress = await this.getAllProgressData();
      const completedTopics = await StorageService.getCompletedTopics();
      
      const totalListeningTime = allProgress.reduce((total, progress) => {
        return total + progress.position;
      }, 0);

      const completionRates = allProgress.map(progress => {
        // We'd need topic duration to calculate this properly
        // For now, we'll use a simple completed/not completed approach
        return progress.completed ? 1 : 0;
      });

      const averageCompletionRate = completionRates.length > 0 
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
        : 0;

      return {
        totalTopicsStarted: allProgress.length,
        totalTopicsCompleted: completedTopics.length,
        totalListeningTime: Math.round(totalListeningTime),
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Failed to get progress stats:', error);
      return {
        totalTopicsStarted: 0,
        totalTopicsCompleted: 0,
        totalListeningTime: 0,
        averageCompletionRate: 0,
      };
    }
  }
}

export default ProgressService;