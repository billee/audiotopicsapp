/**
 * Notification service for lock screen controls and background playback notifications
 */

import { AudioTopic } from '../types';

export interface NotificationServiceInterface {
  setupNotifications(): Promise<void>;
  updatePlaybackNotification(topic: AudioTopic, isPlaying: boolean, position: number): Promise<void>;
  clearNotification(): Promise<void>;
  handleNotificationActions(): void;
}

class NotificationService implements NotificationServiceInterface {
  private isInitialized = false;
  private actionHandlers: Map<string, () => void> = new Map();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize notification system
      // Note: In a real implementation, you would use a library like
      // @react-native-community/push-notification-ios or react-native-push-notification
      
      // For now, we'll use the TrackPlayer's built-in notification system
      // which is already configured in AudioService
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      throw new Error('Notification service initialization failed');
    }
  }

  async setupNotifications(): Promise<void> {
    await this.ensureInitialized();
    
    // Setup notification channels for Android
    // Setup notification categories for iOS
    // This is handled by react-native-track-player in our case
    
    console.log('Notifications setup completed');
  }

  async updatePlaybackNotification(
    topic: AudioTopic, 
    isPlaying: boolean, 
    position: number
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      // Update the notification with current playback state
      // This is automatically handled by react-native-track-player
      // when we update the track metadata and playback state
      
      // In a custom implementation, you would:
      // 1. Create notification content with topic info
      // 2. Add playback controls (play/pause, next, previous)
      // 3. Update progress if supported
      // 4. Show/update the notification
      
      console.log(`Updated notification for: ${topic.title}, playing: ${isPlaying}, position: ${position}`);
    } catch (error) {
      console.error('Failed to update playback notification:', error);
    }
  }

  async clearNotification(): Promise<void> {
    await this.ensureInitialized();

    try {
      // Clear the playback notification
      // This is handled by react-native-track-player when playback stops
      
      console.log('Cleared playback notification');
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  }

  handleNotificationActions(): void {
    // Handle notification action events
    // This is handled by react-native-track-player's event system
    // in AudioService through remote control events
    
    // In a custom implementation, you would:
    // 1. Listen for notification action events
    // 2. Map actions to audio player functions
    // 3. Update playback state accordingly
    
    console.log('Notification actions handler setup');
  }

  // Register action handlers for notification buttons
  registerActionHandler(action: string, handler: () => void): void {
    this.actionHandlers.set(action, handler);
  }

  // Unregister action handler
  unregisterActionHandler(action: string): void {
    this.actionHandlers.delete(action);
  }

  // Execute action handler
  private executeAction(action: string): void {
    const handler = this.actionHandlers.get(action);
    if (handler) {
      handler();
    } else {
      console.warn(`No handler registered for action: ${action}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

export default NotificationService;