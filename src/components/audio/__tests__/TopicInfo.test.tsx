/**
 * TopicInfo component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import TopicInfo from '../TopicInfo';
import { AudioTopic } from '../../../types';

const mockTopic: AudioTopic = {
  id: '1',
  title: 'Test Audio Topic',
  description: 'This is a test audio topic with a longer description that should be displayed properly.',
  categoryId: 'category1',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 300,
  author: 'Test Author',
  publishDate: '2023-01-01T00:00:00.000Z',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 5000000,
  },
};

describe('TopicInfo', () => {
  it('renders correctly with full topic information', () => {
    const { getByTestId, getByText } = render(
      <TopicInfo topic={mockTopic} layout="full" />
    );

    expect(getByTestId('topic-title')).toBeTruthy();
    expect(getByTestId('topic-author')).toBeTruthy();
    expect(getByTestId('topic-description')).toBeTruthy();
    expect(getByTestId('topic-duration')).toBeTruthy();
    expect(getByTestId('topic-publish-date')).toBeTruthy();
    expect(getByTestId('topic-quality')).toBeTruthy();
    expect(getByTestId('topic-thumbnail')).toBeTruthy();

    expect(getByText('Test Audio Topic')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
    expect(getByText('5:00')).toBeTruthy(); // Duration formatted
    expect(getByText('MP3 • 128 kbps')).toBeTruthy(); // Quality info
  });

  it('renders correctly in compact layout', () => {
    const { getByTestId, getByText } = render(
      <TopicInfo topic={mockTopic} layout="compact" />
    );

    expect(getByTestId('topic-title')).toBeTruthy();
    expect(getByTestId('topic-author')).toBeTruthy();
    expect(getByTestId('topic-thumbnail')).toBeTruthy();

    expect(getByText('Test Audio Topic')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();

    // Should not show description and metadata in compact mode
    expect(() => getByTestId('topic-description')).toThrow();
    expect(() => getByTestId('topic-duration')).toThrow();
  });

  it('renders placeholder when no topic is provided', () => {
    const { getByText } = render(<TopicInfo topic={null} />);

    expect(getByText('No topic selected')).toBeTruthy();
  });

  it('handles topic without optional fields', () => {
    const minimalTopic: AudioTopic = {
      id: '2',
      title: 'Minimal Topic',
      description: 'Basic description',
      categoryId: 'category1',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 180,
      metadata: {
        bitrate: 64,
        format: 'mp3',
        size: 3000000,
      },
    };

    const { getByTestId, getByText, queryByTestId } = render(
      <TopicInfo topic={minimalTopic} layout="full" />
    );

    expect(getByText('Minimal Topic')).toBeTruthy();
    expect(getByText('Unknown Artist')).toBeTruthy(); // Default author
    expect(getByTestId('topic-duration')).toBeTruthy();
    expect(getByTestId('topic-quality')).toBeTruthy();

    // Should not show thumbnail, author, or publish date
    expect(queryByTestId('topic-thumbnail')).toBeNull();
    expect(queryByTestId('topic-publish-date')).toBeNull();
  });

  it('formats duration correctly', () => {
    const topicWithLongDuration: AudioTopic = {
      ...mockTopic,
      duration: 3661, // 1 hour, 1 minute, 1 second
    };

    const { getByText } = render(
      <TopicInfo topic={topicWithLongDuration} layout="full" />
    );

    expect(getByText('61:01')).toBeTruthy(); // Should show as minutes:seconds
  });

  it('formats publish date correctly', () => {
    const { getByText } = render(
      <TopicInfo topic={mockTopic} layout="full" />
    );

    expect(getByText('Jan 1, 2023')).toBeTruthy();
  });

  it('displays thumbnail image when available', () => {
    const { getByTestId } = render(
      <TopicInfo topic={mockTopic} layout="full" />
    );

    const thumbnail = getByTestId('topic-thumbnail');
    expect(thumbnail.props.source).toEqual({ uri: mockTopic.thumbnailUrl });
  });

  it('applies custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <TopicInfo topic={mockTopic} style={customStyle} />
    );

    const container = getByTestId('topic-title').parent?.parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('truncates description in full layout', () => {
    const topicWithLongDescription: AudioTopic = {
      ...mockTopic,
      description: 'This is a very long description that should be truncated after three lines to prevent the component from taking up too much space on the screen.',
    };

    const { getByTestId } = render(
      <TopicInfo topic={topicWithLongDescription} layout="full" />
    );

    const description = getByTestId('topic-description');
    expect(description.props.numberOfLines).toBe(3);
  });

  it('truncates title and author in compact layout', () => {
    const { getByTestId } = render(
      <TopicInfo topic={mockTopic} layout="compact" />
    );

    const title = getByTestId('topic-title');
    const author = getByTestId('topic-author');

    expect(title.props.numberOfLines).toBe(1);
    expect(author.props.numberOfLines).toBe(1);
  });

  it('handles different audio formats', () => {
    const flacTopic: AudioTopic = {
      ...mockTopic,
      metadata: {
        bitrate: 1411,
        format: 'flac',
        size: 50000000,
      },
    };

    const { getByText } = render(
      <TopicInfo topic={flacTopic} layout="full" />
    );

    expect(getByText('FLAC • 1411 kbps')).toBeTruthy();
  });
});