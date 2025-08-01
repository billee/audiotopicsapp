import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressData, CategoryPreferences } from '../types';

/**
 * Data migration utilities for handling app updates
 * Manages version transitions and data structure changes
 */
export class MigrationManager {
  // Migration version constants
  private static readonly MIGRATION_VERSIONS = {
    INITIAL: '1.0.0',
    // Add future versions here as needed
    // V1_1_0: '1.1.0',
    // V1_2_0: '1.2.0',
  };

  /**
   * Execute migration from one version to another
   */
  static async executeMigration(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Starting migration from ${fromVersion} to ${toVersion}`);
    
    try {
      // Execute version-specific migrations in sequence
      const migrationPath = this.getMigrationPath(fromVersion, toVersion);
      
      for (const migration of migrationPath) {
        await this.executeSingleMigration(migration.from, migration.to);
      }
      
      console.log(`Migration completed successfully from ${fromVersion} to ${toVersion}`);
    } catch (error) {
      console.error('Migration failed:', error);
      throw new Error(`Migration from ${fromVersion} to ${toVersion} failed: ${error}`);
    }
  }

  /**
   * Get the migration path between two versions
   */
  private static getMigrationPath(fromVersion: string, toVersion: string): Array<{from: string, to: string}> {
    // For now, we only support direct migrations
    // In the future, this could handle multi-step migrations
    return [{ from: fromVersion, to: toVersion }];
  }

  /**
   * Execute a single migration step
   */
  private static async executeSingleMigration(fromVersion: string, toVersion: string): Promise<void> {
    // Add specific migration logic based on version combinations
    
    // Example migration patterns:
    // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
    //   await this.migrateToV1_1_0();
    // } else if (fromVersion === '1.1.0' && toVersion === '1.2.0') {
    //   await this.migrateToV1_2_0();
    // }
    
    // For now, log the migration attempt
    console.log(`Executing migration from ${fromVersion} to ${toVersion}`);
    
    // Validate data integrity after migration
    await this.validateDataIntegrity();
  }

  /**
   * Validate data integrity after migration
   */
  private static async validateDataIntegrity(): Promise<void> {
    try {
      // Check that essential data structures are valid
      await this.validateProgressData();
      await this.validateCategoryPreferences();
      
      console.log('Data integrity validation passed');
    } catch (error) {
      console.error('Data integrity validation failed:', error);
      throw new Error('Data integrity validation failed after migration');
    }
  }

  /**
   * Validate progress data structure
   */
  private static async validateProgressData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('audio_progress_'));
      
      for (const key of progressKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const progressData = JSON.parse(data);
          
          // Validate required fields
          if (!progressData.topicId || 
              typeof progressData.position !== 'number' ||
              typeof progressData.completed !== 'boolean' ||
              !progressData.lastPlayed ||
              typeof progressData.playCount !== 'number') {
            throw new Error(`Invalid progress data structure for key: ${key}`);
          }
          
          // Validate data types
          if (isNaN(new Date(progressData.lastPlayed).getTime())) {
            throw new Error(`Invalid date format in progress data for key: ${key}`);
          }
        }
      }
    } catch (error) {
      throw new Error(`Progress data validation failed: ${error}`);
    }
  }

  /**
   * Validate category preferences structure
   */
  private static async validateCategoryPreferences(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('category_preferences');
      if (data) {
        const preferences = JSON.parse(data);
        
        // Validate required fields
        if (!Array.isArray(preferences.favoriteCategories) ||
            !Array.isArray(preferences.recentlyViewed) ||
            !['alphabetical', 'recent', 'popular'].includes(preferences.sortOrder)) {
          throw new Error('Invalid category preferences structure');
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Category preferences validation failed: Invalid JSON format`);
      }
      throw new Error(`Category preferences validation failed: ${error}`);
    }
  }

  /**
   * Create backup of current data before migration
   */
  static async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `backup_${timestamp}`;
      
      // Get all current data
      const keys = await AsyncStorage.getAllKeys();
      const allData: Record<string, string | null> = {};
      
      for (const key of keys) {
        allData[key] = await AsyncStorage.getItem(key);
      }
      
      // Store backup
      await AsyncStorage.setItem(backupKey, JSON.stringify({
        timestamp: new Date().toISOString(),
        data: allData,
      }));
      
      console.log(`Backup created with key: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error('Failed to create data backup');
    }
  }

  /**
   * Restore data from backup
   */
  static async restoreFromBackup(backupKey: string): Promise<void> {
    try {
      const backupData = await AsyncStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error(`Backup not found: ${backupKey}`);
      }
      
      const backup = JSON.parse(backupData);
      
      // Clear current data
      const currentKeys = await AsyncStorage.getAllKeys();
      const dataKeys = currentKeys.filter(key => !key.startsWith('backup_'));
      await AsyncStorage.multiRemove(dataKeys);
      
      // Restore backup data
      for (const [key, value] of Object.entries(backup.data)) {
        if (value !== null && !key.startsWith('backup_')) {
          await AsyncStorage.setItem(key, value as string);
        }
      }
      
      console.log(`Data restored from backup: ${backupKey}`);
    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw new Error(`Failed to restore from backup: ${error}`);
    }
  }

  /**
   * Clean up old backups (keep only the most recent 5)
   */
  static async cleanupOldBackups(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const backupKeys = keys
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse(); // Most recent first
      
      // Keep only the 5 most recent backups
      const keysToRemove = backupKeys.slice(5);
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} old backups`);
      }
    } catch (error) {
      console.error('Backup cleanup failed:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get list of available backups
   */
  static async getAvailableBackups(): Promise<Array<{key: string, timestamp: string}>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const backupKeys = keys.filter(key => key.startsWith('backup_'));
      
      const backups = [];
      for (const key of backupKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const backup = JSON.parse(data);
          backups.push({
            key,
            timestamp: backup.timestamp,
          });
        }
      }
      
      return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      console.error('Failed to get available backups:', error);
      return [];
    }
  }

  /**
   * Repair corrupted data structures
   */
  static async repairCorruptedData(): Promise<void> {
    try {
      console.log('Starting data repair process');
      
      // Repair progress data
      await this.repairProgressData();
      
      // Repair category preferences
      await this.repairCategoryPreferences();
      
      // Repair completed topics list
      await this.repairCompletedTopics();
      
      console.log('Data repair completed successfully');
    } catch (error) {
      console.error('Data repair failed:', error);
      throw new Error(`Data repair failed: ${error}`);
    }
  }

  /**
   * Repair corrupted progress data
   */
  private static async repairProgressData(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const progressKeys = keys.filter(key => key.startsWith('audio_progress_'));
    
    for (const key of progressKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const progressData = JSON.parse(data);
          
          // Repair missing or invalid fields
          const repairedData: ProgressData = {
            topicId: progressData.topicId || key.replace('audio_progress_', ''),
            position: typeof progressData.position === 'number' ? progressData.position : 0,
            completed: typeof progressData.completed === 'boolean' ? progressData.completed : false,
            lastPlayed: progressData.lastPlayed ? new Date(progressData.lastPlayed) : new Date(),
            playCount: typeof progressData.playCount === 'number' ? progressData.playCount : 1,
          };
          
          // Save repaired data
          await AsyncStorage.setItem(key, JSON.stringify(repairedData));
        }
      } catch (error) {
        console.error(`Failed to repair progress data for key ${key}:`, error);
        // Remove corrupted entry
        await AsyncStorage.removeItem(key);
      }
    }
  }

  /**
   * Repair corrupted category preferences
   */
  private static async repairCategoryPreferences(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('category_preferences');
      if (data) {
        const preferences = JSON.parse(data);
        
        // Repair missing or invalid fields
        const repairedPreferences: CategoryPreferences = {
          favoriteCategories: Array.isArray(preferences.favoriteCategories) 
            ? preferences.favoriteCategories 
            : [],
          recentlyViewed: Array.isArray(preferences.recentlyViewed) 
            ? preferences.recentlyViewed 
            : [],
          sortOrder: ['alphabetical', 'recent', 'popular'].includes(preferences.sortOrder) 
            ? preferences.sortOrder 
            : 'alphabetical',
        };
        
        // Save repaired preferences
        await AsyncStorage.setItem('category_preferences', JSON.stringify(repairedPreferences));
      }
    } catch (error) {
      console.error('Failed to repair category preferences:', error);
      // Create default preferences
      const defaultPreferences: CategoryPreferences = {
        favoriteCategories: [],
        recentlyViewed: [],
        sortOrder: 'alphabetical',
      };
      await AsyncStorage.setItem('category_preferences', JSON.stringify(defaultPreferences));
    }
  }

  /**
   * Repair corrupted completed topics list
   */
  private static async repairCompletedTopics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('completed_topics');
      if (data) {
        const completedTopics = JSON.parse(data);
        
        // Ensure it's an array
        if (!Array.isArray(completedTopics)) {
          await AsyncStorage.setItem('completed_topics', JSON.stringify([]));
        }
      }
    } catch (error) {
      console.error('Failed to repair completed topics:', error);
      // Create empty array
      await AsyncStorage.setItem('completed_topics', JSON.stringify([]));
    }
  }
}

export default MigrationManager;