/**
 * Validation utility functions
 */

import { AudioTopic, Category } from '../types';

/**
 * Validate audio topic data
 */
export const validateAudioTopic = (topic: any): topic is AudioTopic => {
  return (
    typeof topic === 'object' &&
    typeof topic.id === 'string' &&
    typeof topic.title === 'string' &&
    typeof topic.description === 'string' &&
    typeof topic.categoryId === 'string' &&
    typeof topic.audioUrl === 'string' &&
    typeof topic.duration === 'number' &&
    topic.duration > 0 &&
    typeof topic.metadata === 'object' &&
    typeof topic.metadata.bitrate === 'number' &&
    typeof topic.metadata.format === 'string' &&
    typeof topic.metadata.size === 'number'
  );
};

/**
 * Validate category data
 */
export const validateCategory = (category: any): category is Category => {
  return (
    typeof category === 'object' &&
    typeof category.id === 'string' &&
    typeof category.name === 'string' &&
    typeof category.description === 'string' &&
    typeof category.topicCount === 'number' &&
    category.topicCount >= 0 &&
    typeof category.color === 'string'
  );
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate audio file format
 */
export const isValidAudioFormat = (format: string): boolean => {
  const validFormats = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
  return validFormats.includes(format.toLowerCase());
};