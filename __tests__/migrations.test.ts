import AsyncStorage from '@react-native-async-storage/async-storage';
import { MigrationManager } from '../src/utils/migrations';
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

describe('MigrationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.removeItem.mockResolvedValue();
    mockAsyncStorage.multiRemove.mockResolvedValue();
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
  });

  describe('executeMigration', () => {
    it('should execute migration successfully', async () => {
      // Mock valid data for validation
      mockAsyncStorage.getAllKeys.mockResolvedValue(['audio_progress_topic1', 'category_preferences']);
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          topicId: 'topic1',
          position: 100,
          completed: false,
          lastPlayed: new Date().toISOString(),
          playCount: 1,
        }))
        .mockResolvedValueOnce(JSON.stringify({
          favoriteCategories: [],
          recentlyViewed: [],
          sortOrder: 'alphabetical',
        }));

      await MigrationManager.executeMigration('1.0.0', '1.1.0');

      // Should complete without throwing
      expect(mockAsyncStorage.getAllKeys).toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      await expect(MigrationManager.executeMigration('1.0.0', '1.1.0'))
        .rejects.toThrow('Migration from 1.0.0 to 1.1.0 failed');
    });
  });

  describe('createBackup', () => {
    it('should create backup successfully', async () => {
      const mockData = {
        'audio_progress_topic1': JSON.stringify({ topicId: 'topic1', position: 100 }),
        'category_preferences': JSON.stringify({ favoriteCategories: [] }),
      };

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(Object.keys(mockData));
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(mockData['audio_progress_topic1'])
        .mockResolvedValueOnce(mockData['category_preferences']);

      const backupKey = await MigrationManager.createBackup();

      expect(backupKey).toMatch(/^backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        backupKey,
        expect.stringContaining('"timestamp"')
      );
    });

    it('should handle backup creation errors', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      await expect(MigrationManager.createBackup())
        .rejects.toThrow('Failed to create data backup');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore from backup successfully', async () => {
      const backupKey = 'backup_2023-01-01T10-00-00-000Z';
      const backupData = {
        timestamp: '2023-01-01T10:00:00.000Z',
        data: {
          'audio_progress_topic1': JSON.stringify({ topicId: 'topic1' }),
          'category_preferences': JSON.stringify({ favoriteCategories: [] }),
        },
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(backupData));
      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(['current_key1', 'current_key2']);

      await MigrationManager.restoreFromBackup(backupKey);

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith(['current_key1', 'current_key2']);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'audio_progress_topic1',
        backupData.data['audio_progress_topic1']
      );
    });

    it('should handle missing backup', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await expect(MigrationManager.restoreFromBackup('nonexistent_backup'))
        .rejects.toThrow('Backup not found: nonexistent_backup');
    });

    it('should handle restore errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(MigrationManager.restoreFromBackup('backup_key'))
        .rejects.toThrow('Failed to restore from backup');
    });
  });

  describe('cleanupOldBackups', () => {
    it('should clean up old backups', async () => {
      const backupKeys = [
        'backup_2023-01-01T10-00-00-000Z',
        'backup_2023-01-02T10-00-00-000Z',
        'backup_2023-01-03T10-00-00-000Z',
        'backup_2023-01-04T10-00-00-000Z',
        'backup_2023-01-05T10-00-00-000Z',
        'backup_2023-01-06T10-00-00-000Z',
        'backup_2023-01-07T10-00-00-000Z',
      ];

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce([
        ...backupKeys,
        'other_key1',
        'other_key2',
      ]);

      await MigrationManager.cleanupOldBackups();

      // Should remove the 2 oldest backups (keep only 5 most recent)
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'backup_2023-01-02T10-00-00-000Z',
        'backup_2023-01-01T10-00-00-000Z',
      ]);
    });

    it('should handle cleanup errors gracefully', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(MigrationManager.cleanupOldBackups()).resolves.toBeUndefined();
    });
  });

  describe('getAvailableBackups', () => {
    it('should return available backups', async () => {
      const backupKeys = ['backup_2023-01-01T10-00-00-000Z', 'backup_2023-01-02T10-00-00-000Z'];
      const backupData1 = { timestamp: '2023-01-01T10:00:00.000Z', data: {} };
      const backupData2 = { timestamp: '2023-01-02T10:00:00.000Z', data: {} };

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce([...backupKeys, 'other_key']);
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(backupData1))
        .mockResolvedValueOnce(JSON.stringify(backupData2));

      const backups = await MigrationManager.getAvailableBackups();

      expect(backups).toEqual([
        { key: 'backup_2023-01-02T10-00-00-000Z', timestamp: '2023-01-02T10:00:00.000Z' },
        { key: 'backup_2023-01-01T10-00-00-000Z', timestamp: '2023-01-01T10:00:00.000Z' },
      ]);
    });

    it('should handle errors gracefully', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      const backups = await MigrationManager.getAvailableBackups();

      expect(backups).toEqual([]);
    });
  });

  describe('repairCorruptedData', () => {
    it('should repair corrupted data successfully', async () => {
      // Mock corrupted progress data
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'audio_progress_topic1',
        'category_preferences',
        'completed_topics',
      ]);

      // Mock corrupted progress data
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          // Missing required fields
          position: 'invalid',
          completed: 'not_boolean',
        }))
        .mockResolvedValueOnce(JSON.stringify({
          // Invalid category preferences
          favoriteCategories: 'not_array',
          sortOrder: 'invalid_sort',
        }))
        .mockResolvedValueOnce('not_valid_json');

      await MigrationManager.repairCorruptedData();

      // Should have attempted to repair data
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle repair errors', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      await expect(MigrationManager.repairCorruptedData())
        .rejects.toThrow('Data repair failed');
    });
  });

  describe('data validation', () => {
    it('should validate progress data structure', async () => {
      const validProgressData: ProgressData = {
        topicId: 'topic1',
        position: 100,
        completed: false,
        lastPlayed: new Date(),
        playCount: 1,
      };

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(['audio_progress_topic1']);
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(validProgressData));

      // Should not throw when validating valid data
      await expect(MigrationManager.executeMigration('1.0.0', '1.1.0')).resolves.toBeUndefined();
    });

    it('should detect invalid progress data', async () => {
      const invalidProgressData = {
        // Missing required fields
        position: 'invalid',
      };

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(['audio_progress_topic1']);
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(invalidProgressData));

      await expect(MigrationManager.executeMigration('1.0.0', '1.1.0'))
        .rejects.toThrow('Migration from 1.0.0 to 1.1.0 failed');
    });

    it('should validate category preferences structure', async () => {
      const validPreferences: CategoryPreferences = {
        favoriteCategories: ['cat1'],
        recentlyViewed: ['cat2'],
        sortOrder: 'alphabetical',
      };

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(['category_preferences']);
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // No progress data
        .mockResolvedValueOnce(JSON.stringify(validPreferences));

      // Should not throw when validating valid data
      await expect(MigrationManager.executeMigration('1.0.0', '1.1.0')).resolves.toBeUndefined();
    });

    it('should handle category preferences validation', async () => {
      const validPreferences: CategoryPreferences = {
        favoriteCategories: ['cat1'],
        recentlyViewed: ['cat2'],
        sortOrder: 'alphabetical',
      };

      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(['category_preferences']);
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(validPreferences));

      // Should not throw when validating valid data
      await expect(MigrationManager.executeMigration('1.0.0', '1.1.0')).resolves.toBeUndefined();
    });
  });
});