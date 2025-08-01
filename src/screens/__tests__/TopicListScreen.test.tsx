/**
 * TopicListScreen component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { configureStore } from '@reduxjs/toolkit';
import TopicListScreen from '../TopicListScreen';
import audioReducer from '../../store/slices/audioSlice';
import categoriesReducer from '../../store/slices/categoriesSlice';
import topicsReducer from '../../store/slices/topicsSlice';
import userPreferencesReducer from '../../store/slices/userPreferencesSlice';

// Mock the hooks
jest.mock('../../hooks/useTopics', () => ({
  useTopics: jest.fn(() => ({
    topicsWithProgress: [
      {
        id: 'topic-1',
        title: 'Test Topic 1',
        description: 'Test Description 1',
        categoryId: 'cat-1',
        audioUrl: 'https://example.com/audio1.mp3',
        duration: 1800,
        author: 'Test Author 1',
        metadata: { bitrate: 128, format: 'mp3', size: 1000 },
        progress: null,
        isCompleted: false,
        isInProgress: false,
        progressPercentage: 0,
      },
      {
        id: 'topic-2',
        title: 'Test Topic 2',
        description: 'Test Description 2',
        categoryId: 'cat-1',
        audioUrl: 'https://example.com/audio2.mp3',
        duration: 2400,
        author: 'Test Author 2',
        metadata: { bitrate: 128, format: 'mp3', size: 1500 },
        progress: {
          topicId: 'topic-2',
          position: 1200,
          completed: false,
          lastPlayed: new Date(),
          playCount: 1,
        },
        isCompleted: false,
        isInProgress: true,
        progressPercentage: 50,
      },
    ],
    loading: false,
    error: null,
    stats: {
      totalTopics: 2,
      completedCount: 0,
      inProgressCount: 1,
      notStartedCount: 1,
      completionPercentage: 0,
    },
    loadTopicsForCategory: jest.fn(),
    refreshTopics: jest.fn(),
  })),
}));

// Mock the TopicList component
jest.mock('../../components/topic', () => ({
  TopicList: ({ topics, onTopicPress }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="topic-list">
        {topics.map((topic: any) => (
          <TouchableOpacity
            key={topic.id}
            onPress={() => onTopicPress(topic)}
            testID={`topic-${topic.id}`}
          >
            <Text>{topic.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
}));

const Stack = createStackNavigator();

const createTestStore = () => {
  return configureStore({
    reducer: {
      audio: audioReducer,
      categories: categoriesReducer,
      topics: topicsReducer,
      userPreferences: userPreferencesReducer,
    },
    preloadedState: {
      categories: {
        categories: [
          {
            id: 'cat-1',
            name: 'Test Category',
            description: 'Test Category Description',
            color: '#007AFF',
            topicCount: 2,
            backgroundImageUrl: 'https://example.com/bg.jpg',
          },
        ],
        selectedCategoryId: null,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      },
      audio: {
        isPlaying: false,
        currentTopic: null,
        currentPosition: 0,
        duration: 0,
        volume: 1.0,
        playbackRate: 1.0,
        isLoading: false,
        error: null,
        playlist: [],
        currentIndex: -1,
        repeatMode: 'none' as const,
        shuffleMode: false,
      },
      topics: {
        topics: [],
        topicsByCategory: {},
        currentCategoryTopics: [],
        selectedCategoryId: null,
        loading: false,
        error: null,
        progressData: {},
      },
      userPreferences: {
        categoryPreferences: {
          favoriteCategories: [],
          recentlyViewed: [],
          sortOrder: 'alphabetical' as const,
        },
        progressData: {},
        lastUpdated: Date.now(),
      },
    },
  });
};

const TestNavigator = ({ initialParams }: { initialParams: any }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TopicList"
        component={TopicListScreen}
        initialParams={initialParams}
      />
    </Stack.Navigator>
  );
};

const renderWithProviders = (initialParams: any) => {
  const store = createTestStore();
  
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <TestNavigator initialParams={initialParams} />
      </NavigationContainer>
    </Provider>
  );
};

describe('TopicListScreen', () => {
  it('renders topic list correctly', () => {
    const { getByTestId, getByText } = renderWithProviders({ categoryId: 'cat-1' });

    expect(getByTestId('topic-list')).toBeTruthy();
    expect(getByText('Test Topic 1')).toBeTruthy();
    expect(getByText('Test Topic 2')).toBeTruthy();
  });

  it('renders with category background image', () => {
    const { getByTestId } = renderWithProviders({ categoryId: 'cat-1' });

    // The component should render without errors when background image is present
    expect(getByTestId('topic-list')).toBeTruthy();
  });

  it('handles missing category gracefully', () => {
    const { getByTestId } = renderWithProviders({ categoryId: 'non-existent' });

    // Should still render the topic list even if category is not found
    expect(getByTestId('topic-list')).toBeTruthy();
  });

  it('passes correct props to TopicList component', () => {
    const { getByTestId } = renderWithProviders({ categoryId: 'cat-1' });

    // Verify that TopicList is rendered (our mock component)
    expect(getByTestId('topic-list')).toBeTruthy();
    
    // Verify that topics are passed correctly (by checking if they're rendered)
    expect(getByTestId('topic-topic-1')).toBeTruthy();
    expect(getByTestId('topic-topic-2')).toBeTruthy();
  });
});

// Additional integration test for navigation
describe('TopicListScreen Navigation', () => {
  it('should handle navigation to audio player', () => {
    // This test would require more complex navigation mocking
    // For now, we'll just verify the component renders
    const { getByTestId } = renderWithProviders({ categoryId: 'cat-1' });
    expect(getByTestId('topic-list')).toBeTruthy();
  });
});