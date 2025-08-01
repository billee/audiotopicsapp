import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressData, CategoryPreferences } from '../types';

/**
 * Storage Service for handling local data persistence
 * Manages progress tracking, preferences, and app data
 */
class StorageService {
  // Storage keys
  private static readonly KEYS = {
    PROGRESS: 'audio_progress',
    COMPLETED_TOPICS: 'completed_topics',
    CATEGORY_PREFERENCES: 'category_preferences',
    APP_VERSION: 'app_version',
    USER_SETTINGS: 'user_settings',
  };

  // Current app version for migration purposes
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Initialize storage service and handle migrations
   */
  static async initialize(): Promise<void> {
    try {
      await this.handleMigrations();
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw new Error('Failed to initialize storage service');
    }
  }

  /**
   * Save playback progress for a specific topic
   */
  static async saveProgress(topicId: string, position: number): Promise<void> {
    try {
      const progressData: ProgressData = {
        topicId,
        position,
        completed: false,
        lastPlayed: new Date(),
        playCount: 1,
      };

      // Get existing progress data
      const existingProgress = await this.getProgressData(topicId);
      if (existingProgress) {
        progressData.playCount = existingProgress.playCount + 1;
        progressData.completed = existingProgress.completed;
      }

      // Save individual progress
      await AsyncStorage.setItem(
        `${this.KEYS.PROGRESS}_${topicId}`,
        JSON.stringify(progressData)
      );

      // Update progress index
      await this.updateProgressIndex(topicId);
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw new Error(`Failed to save progress for topic ${topicId}`);
    }
  }

  /**
   * Get playback progress for a specific topic
   */
  static async getProgress(topicId: string): Promise<number> {
    try {
      const progressData = await this.getProgressData(topicId);
      return progressData?.position || 0;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return 0;
    }
  }

  /**
   * Get complete progress data for a topic
   */
  static async getProgressData(topicId: string): Promise<ProgressData | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.KEYS.PROGRESS}_${topicId}`);
      if (!data) return null;

      const progressData = JSON.parse(data);
      // Convert date string back to Date object
      progressData.lastPlayed = new Date(progressData.lastPlayed);
      return progressData;
    } catch (error) {
      console.error('Failed to get progress data:', error);
      return null;
    }
  }

  /**
   * Mark a topic as completed
   */
  static async markCompleted(topicId: string): Promise<void> {
    try {
      // Update progress data
      const existingProgress = await this.getProgressData(topicId);
      const progressData: ProgressData = {
        topicId,
        position: existingProgress?.position || 0,
        completed: true,
        lastPlayed: new Date(),
        playCount: existingProgress?.playCount || 1,
      };

      await AsyncStorage.setItem(
        `${this.KEYS.PROGRESS}_${topicId}`,
        JSON.stringify(progressData)
      );

      // Update completed topics list
      const completedTopics = await this.getCompletedTopics();
      if (!completedTopics.includes(topicId)) {
        completedTopics.push(topicId);
        await AsyncStorage.setItem(
          this.KEYS.COMPLETED_TOPICS,
          JSON.stringify(completedTopics)
        );
      }

      // Update progress index
      await this.updateProgressIndex(topicId);
    } catch (error) {
      console.error('Failed to mark topic as completed:', error);
      throw new Error(`Failed to mark topic ${topicId} as completed`);
    }
  }

  /**
   * Get list of completed topic IDs
   */
  static async getCompletedTopics(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.COMPLETED_TOPICS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get completed topics:', error);
      return [];
    }
  }

  /**
   * Save category preferences
   */
  static async saveCategoryPreferences(preferences: CategoryPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.CATEGORY_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Failed to save category preferences:', error);
      throw new Error('Failed to save category preferences');
    }
  }

  /**
   * Get category preferences
   */
  static async getCategoryPreferences(): Promise<CategoryPreferences> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CATEGORY_PREFERENCES);
      if (!data) {
        // Return default preferences
        return {
          favoriteCategories: [],
          recentlyViewed: [],
          sortOrder: 'alphabetical',
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get category preferences:', error);
      // Return default preferences on error
      return {
        favoriteCategories: [],
        recentlyViewed: [],
        sortOrder: 'alphabetical',
      };
    }
  }

  /**
   * Get all progress data for topics
   */
  static async getAllProgressData(): Promise<ProgressData[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith(`${this.KEYS.PROGRESS}_`));
      
      const progressDataArray: ProgressData[] = [];
      for (const key of progressKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const progressData = JSON.parse(data);
          progressData.lastPlayed = new Date(progressData.lastPlayed);
          progressDataArray.push(progressData);
        }
      }
      
      return progressDataArray;
    } catch (error) {
      console.error('Failed to get all progress data:', error);
      return [];
    }
  }

  /**
   * Clear all progress data (for testing or reset purposes)
   */
  static async clearAllProgress(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => 
        key.startsWith(`${this.KEYS.PROGRESS}_`) || 
        key === this.KEYS.COMPLETED_TOPICS
      );
      
      await AsyncStorage.multiRemove(progressKeys);
    } catch (error) {
      console.error('Failed to clear progress data:', error);
      throw new Error('Failed to clear progress data');
    }
  }

  /**
   * Handle app version migrations
   */
  private static async handleMigrations(): Promise<void> {
    try {
      const storedVersion = await AsyncStorage.getItem(this.KEYS.APP_VERSION);
      
      if (!storedVersion) {
        // First time installation
        await this.performInitialSetup();
      } else if (storedVersion !== this.CURRENT_VERSION) {
        // Version upgrade
        await this.performMigration(storedVersion, this.CURRENT_VERSION);
      }
      
      // Update stored version
      await AsyncStorage.setItem(this.KEYS.APP_VERSION, this.CURRENT_VERSION);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Perform initial setup for new installations
   */
  private static async performInitialSetup(): Promise<void> {
    try {
      // Initialize default preferences
      const defaultPreferences: CategoryPreferences = {
        favoriteCategories: [],
        recentlyViewed: [],
        sortOrder: 'alphabetical',
      };
      
      await this.saveCategoryPreferences(defaultPreferences);
      
      // Initialize empty completed topics list
      await AsyncStorage.setItem(this.KEYS.COMPLETED_TOPICS, JSON.stringify([]));
      
      console.log('Initial setup completed');
    } catch (error) {
      console.error('Initial setup failed:', error);
      throw error;
    }
  }

  /**
   * Perform data migration between versions
   */
  private static async performMigration(fromVersion: string, toVersion: string): Promise<void> {
    try {
      console.log(`Migrating from version ${fromVersion} to ${toVersion}`);
      
      // Add version-specific migration logic here
      // For now, we'll just log the migration
      
      // Example migration logic for future versions:
      // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
      //   await this.migrateToV1_1_0();
      // }
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Update progress index for efficient querying
   */
  private static async updateProgressIndex(topicId: string): Promise<void> {
    try {
      // This could be expanded to maintain an index of all topics with progress
      // For now, we'll keep it simple and just ensure the topic is tracked
      const progressData = await this.getProgressData(topicId);
      if (progressData) {
        // Topic is properly tracked
        return;
      }
    } catch (error) {
      console.error('Failed to update progress index:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalKeys: number;
    progressEntries: number;
    completedTopics: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith(`${this.KEYS.PROGRESS}_`));
      const completedTopics = await this.getCompletedTopics();
      
      return {
        totalKeys: keys.length,
        progressEntries: progressKeys.length,
        completedTopics: completedTopics.length,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalKeys: 0,
        progressEntries: 0,
        completedTopics: 0,
      };
    }
  }
}

export default StorageService;