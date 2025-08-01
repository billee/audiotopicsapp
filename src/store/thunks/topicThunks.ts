/**
 * Topic thunks for async operations
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { TopicService } from '../../services';
import { AudioTopic } from '../../types';
import { 
  setLoading, 
  setError, 
  setTopics, 
  setTopicsByCategory, 
  setCurrentCategoryTopics,
  setSelectedCategoryId 
} from '../slices/topicsSlice';

const topicService = TopicService.getInstance();

/**
 * Load all topics
 */
export const loadTopics = createAsyncThunk(
  'topics/loadTopics',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const topics = await topicService.getTopics();
      dispatch(setTopics(topics));
      return topics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topics';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Load topics by category
 */
export const loadTopicsByCategory = createAsyncThunk(
  'topics/loadTopicsByCategory',
  async (categoryId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setSelectedCategoryId(categoryId));
      
      const topics = await topicService.getTopicsByCategory(categoryId);
      
      dispatch(setTopicsByCategory({ categoryId, topics }));
      dispatch(setCurrentCategoryTopics(topics));
      
      return { categoryId, topics };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topics for category';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Load topic by ID
 */
export const loadTopicById = createAsyncThunk(
  'topics/loadTopicById',
  async (topicId: string, { rejectWithValue }) => {
    try {
      const topic = await topicService.getTopicById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }
      return topic;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topic';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Search topics
 */
export const searchTopics = createAsyncThunk(
  'topics/searchTopics',
  async (query: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const topics = await topicService.searchTopics(query);
      dispatch(setCurrentCategoryTopics(topics));
      return topics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search topics';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Load topics sorted by date
 */
export const loadTopicsByDate = createAsyncThunk(
  'topics/loadTopicsByDate',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const topics = await topicService.getTopicsByDate();
      dispatch(setCurrentCategoryTopics(topics));
      return topics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topics by date';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Load topics sorted by duration
 */
export const loadTopicsByDuration = createAsyncThunk(
  'topics/loadTopicsByDuration',
  async (ascending: boolean = true, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const topics = await topicService.getTopicsByDuration(ascending);
      dispatch(setCurrentCategoryTopics(topics));
      return topics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topics by duration';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);