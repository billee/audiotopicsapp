/**
 * TopicCard component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TopicCard from '../TopicCard';
import { AudioTopic, ProgressData } from '../../../types';

// Mock the formatters utility
jest.mock('../../../utils/formatters', () => ({
  formatDuration: jest.fn((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }),
}));

const mockTopic: AudioTopic = {
  id: 'test-topic-1',
  title: 'Test Topic Title',
  description: 'This is a test topic description that should be displayed in the card.',
  categoryId: 'test-category',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 1800, // 30 minutes
  author: 'Test Author',
  publishDate: new Date('2024-01-15'),
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 28800000,
  },
};

const mockProgress: ProgressData = {
  topicId: 'test-topic-1',
  position: 900, // 15 minutes
  completed: false,
  lastPlayed: new Date('2024-01-20'),
  playCount: 2,
};

const mockCompletedProgress: ProgressData = {
  topicId: 'test-topic-1',
  position: 1800, // Full duration
  completed: true,
  lastPlayed: new Date('2024-01-20'),
  playCount: 3,
};

describe('TopicCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders topic information correctly', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Test Topic Title')).toBeTruthy();
    expect(getByText('This is a test topic description that should be displayed in the card.')).toBeTruthy();
    expect(getByText('30:00')).toBeTruthy(); // Duration formatted
    expect(getByText('Test Author')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Test Topic Title'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTopic);
  });

  it('displays progress bar for in-progress topics', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={mockProgress}
        onPress={mockOnPress}
      />
    );

    expect(getByText('50%')).toBeTruthy(); // 900/1800 = 50%
  });

  it('displays completed status for completed topics', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={mockCompletedProgress}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Completed')).toBeTruthy();
  });

  it('shows playing indicator when topic is currently playing', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        onPress={mockOnPress}
        isPlaying={true}
      />
    );

    expect(getByText('♪')).toBeTruthy();
  });

  it('shows in-progress indicator for partially played topics', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={mockProgress}
        onPress={mockOnPress}
      />
    );

    expect(getByText('▶')).toBeTruthy();
  });

  it('shows completed indicator for completed topics', () => {
    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={mockCompletedProgress}
        onPress={mockOnPress}
      />
    );

    expect(getByText('✓')).toBeTruthy();
  });

  it('renders without thumbnail when thumbnailUrl is not provided', () => {
    const topicWithoutThumbnail = { ...mockTopic, thumbnailUrl: undefined };
    const { getByText } = render(
      <TopicCard
        topic={topicWithoutThumbnail}
        onPress={mockOnPress}
      />
    );

    // Should show placeholder
    expect(getByText('♪')).toBeTruthy();
  });

  it('renders without author when author is not provided', () => {
    const topicWithoutAuthor = { ...mockTopic, author: undefined };
    const { queryByText } = render(
      <TopicCard
        topic={topicWithoutAuthor}
        onPress={mockOnPress}
      />
    );

    expect(queryByText('Test Author')).toBeNull();
    expect(queryByText('•')).toBeNull(); // Separator should not be shown
  });

  it('handles zero progress correctly', () => {
    const zeroProgress: ProgressData = {
      ...mockProgress,
      position: 0,
      completed: false,
    };

    const { queryByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={zeroProgress}
        onPress={mockOnPress}
      />
    );

    // Should not show progress bar for zero progress
    expect(queryByText('0%')).toBeNull();
  });

  it('calculates progress percentage correctly', () => {
    const partialProgress: ProgressData = {
      ...mockProgress,
      position: 450, // 7.5 minutes
    };

    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={partialProgress}
        onPress={mockOnPress}
      />
    );

    expect(getByText('25%')).toBeTruthy(); // 450/1800 = 25%
  });

  it('limits progress percentage to 100%', () => {
    const overProgress: ProgressData = {
      ...mockProgress,
      position: 2000, // More than duration
    };

    const { getByText } = render(
      <TopicCard
        topic={mockTopic}
        progress={overProgress}
        onPress={mockOnPress}
      />
    );

    expect(getByText('100%')).toBeTruthy();
  });
});