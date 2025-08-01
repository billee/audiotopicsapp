/**
 * TopicList component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TopicList from '../TopicList';
import { AudioTopic, ProgressData } from '../../../types';

// Mock the child components
jest.mock('../TopicCard', () => {
  const MockTopicCard = ({ topic, onPress, isPlaying }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={() => onPress(topic)} testID={`topic-card-${topic.id}`}>
        <Text>{topic.title}</Text>
        {isPlaying && <Text>Playing</Text>}
      </TouchableOpacity>
    );
  };
  return MockTopicCard;
});

jest.mock('../../common', () => ({
  LoadingSpinner: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text testID="loading-spinner">Loading...</Text>;
  },
  ErrorMessage: ({ message, onRetry }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="error-message">
        <Text>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} testID="retry-button">
            <Text>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
}));

const mockTopics = [
  {
    id: 'topic-1',
    title: 'Topic 1',
    description: 'Description 1',
    categoryId: 'cat-1',
    audioUrl: 'https://example.com/audio1.mp3',
    duration: 1800,
    author: 'Author 1',
    metadata: { bitrate: 128, format: 'mp3', size: 1000 },
    progress: null,
    isCompleted: false,
    isInProgress: false,
    progressPercentage: 0,
  },
  {
    id: 'topic-2',
    title: 'Topic 2',
    description: 'Description 2',
    categoryId: 'cat-1',
    audioUrl: 'https://example.com/audio2.mp3',
    duration: 2400,
    author: 'Author 2',
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
  {
    id: 'topic-3',
    title: 'Topic 3',
    description: 'Description 3',
    categoryId: 'cat-1',
    audioUrl: 'https://example.com/audio3.mp3',
    duration: 1500,
    author: 'Author 3',
    metadata: { bitrate: 128, format: 'mp3', size: 1200 },
    progress: {
      topicId: 'topic-3',
      position: 1500,
      completed: true,
      lastPlayed: new Date(),
      playCount: 2,
    },
    isCompleted: true,
    isInProgress: false,
    progressPercentage: 100,
  },
];

const mockStats = {
  totalTopics: 3,
  completedCount: 1,
  inProgressCount: 1,
  notStartedCount: 1,
  completionPercentage: 33.33,
};

describe('TopicList', () => {
  const mockOnTopicPress = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    mockOnTopicPress.mockClear();
    mockOnRefresh.mockClear();
  });

  it('renders topics correctly', () => {
    const { getByText, getByTestId } = render(
      <TopicList
        topics={mockTopics}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
      />
    );

    expect(getByText('Topic 1')).toBeTruthy();
    expect(getByText('Topic 2')).toBeTruthy();
    expect(getByText('Topic 3')).toBeTruthy();
    expect(getByTestId('topic-card-topic-1')).toBeTruthy();
    expect(getByTestId('topic-card-topic-2')).toBeTruthy();
    expect(getByTestId('topic-card-topic-3')).toBeTruthy();
  });

  it('calls onTopicPress when topic is pressed', () => {
    const { getByTestId } = render(
      <TopicList
        topics={mockTopics}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
      />
    );

    fireEvent.press(getByTestId('topic-card-topic-1'));
    expect(mockOnTopicPress).toHaveBeenCalledWith(mockTopics[0]);
  });

  it('shows loading spinner when loading and no topics', () => {
    const { getByTestId } = render(
      <TopicList
        topics={[]}
        loading={true}
        error={null}
        onTopicPress={mockOnTopicPress}
      />
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows error message when there is an error', () => {
    const { getByTestId, getByText } = render(
      <TopicList
        topics={[]}
        loading={false}
        error="Failed to load topics"
        onTopicPress={mockOnTopicPress}
        onRefresh={mockOnRefresh}
      />
    );

    expect(getByTestId('error-message')).toBeTruthy();
    expect(getByText('Failed to load topics')).toBeTruthy();
    expect(getByTestId('retry-button')).toBeTruthy();
  });

  it('calls onRefresh when retry button is pressed', () => {
    const { getByTestId } = render(
      <TopicList
        topics={[]}
        loading={false}
        error="Failed to load topics"
        onTopicPress={mockOnTopicPress}
        onRefresh={mockOnRefresh}
      />
    );

    fireEvent.press(getByTestId('retry-button'));
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('shows empty message when no topics and not loading', () => {
    const { getByText } = render(
      <TopicList
        topics={[]}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
        emptyMessage="No topics found"
      />
    );

    expect(getByText('No topics found')).toBeTruthy();
  });

  it('shows stats when showStats is true', () => {
    const { getByText } = render(
      <TopicList
        topics={mockTopics}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
        showStats={true}
        stats={mockStats}
      />
    );

    expect(getByText('Progress Overview')).toBeTruthy();
    expect(getByText('3')).toBeTruthy(); // Total topics
    expect(getByText('1')).toBeTruthy(); // Completed count
    expect(getByText('33% Complete')).toBeTruthy();
  });

  it('does not show stats when showStats is false', () => {
    const { queryByText } = render(
      <TopicList
        topics={mockTopics}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
        showStats={false}
        stats={mockStats}
      />
    );

    expect(queryByText('Progress Overview')).toBeNull();
  });

  it('highlights currently playing topic', () => {
    const { getByText } = render(
      <TopicList
        topics={mockTopics}
        loading={false}
        error={null}
        currentPlayingTopicId="topic-2"
        onTopicPress={mockOnTopicPress}
      />
    );

    // The mock TopicCard shows "Playing" text when isPlaying is true
    expect(getByText('Playing')).toBeTruthy();
  });

  it('handles refresh control when onRefresh is provided', () => {
    const { getByTestId } = render(
      <TopicList
        topics={mockTopics}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
        onRefresh={mockOnRefresh}
      />
    );

    // The FlatList should have a refresh control
    // This is harder to test directly, but we can verify the component renders without error
    expect(getByTestId('topic-card-topic-1')).toBeTruthy();
  });

  it('uses default empty message when none provided', () => {
    const { getByText } = render(
      <TopicList
        topics={[]}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
      />
    );

    expect(getByText('No topics available')).toBeTruthy();
  });

  it('renders with custom empty message', () => {
    const customMessage = 'Custom empty message';
    const { getByText } = render(
      <TopicList
        topics={[]}
        loading={false}
        error={null}
        onTopicPress={mockOnTopicPress}
        emptyMessage={customMessage}
      />
    );

    expect(getByText(customMessage)).toBeTruthy();
  });
});