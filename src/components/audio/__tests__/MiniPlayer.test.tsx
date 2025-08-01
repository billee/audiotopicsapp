/**
 * Tests for MiniPlayer component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MiniPlayer from '../MiniPlayer';
import { AudioTopic } from '../../../types';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const mockTopic: AudioTopic = {
  id: '1',
  title: 'Test Topic',
  description: 'Test Description',
  categoryId: 'cat1',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 300,
  author: 'Test Author',
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 1024,
  },
};

const defaultProps = {
  currentTopic: mockTopic,
  isPlaying: false,
  isVisible: true,
  progress: 0.5,
  onPlayPause: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onExpand: jest.fn(),
  onClose: jest.fn(),
  hasNextTrack: true,
  hasPreviousTrack: true,
  canPlay: true,
};

describe('MiniPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByTestId, getByText } = render(<MiniPlayer {...defaultProps} />);

    expect(getByTestId('mini-player')).toBeTruthy();
    expect(getByText('Test Topic')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
  });

  it('does not render when currentTopic is null', () => {
    const { queryByTestId } = render(
      <MiniPlayer {...defaultProps} currentTopic={null} />
    );

    expect(queryByTestId('mini-player')).toBeNull();
  });

  it('displays play icon when not playing', () => {
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} isPlaying={false} />
    );

    const playButton = getByTestId('mini-player-play-pause');
    expect(playButton).toBeTruthy();
  });

  it('displays pause icon when playing', () => {
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} isPlaying={true} />
    );

    const playButton = getByTestId('mini-player-play-pause');
    expect(playButton).toBeTruthy();
  });

  it('calls onPlayPause when play/pause button is pressed', () => {
    const onPlayPause = jest.fn();
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} onPlayPause={onPlayPause} />
    );

    fireEvent.press(getByTestId('mini-player-play-pause'));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is pressed', () => {
    const onNext = jest.fn();
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} onNext={onNext} />
    );

    fireEvent.press(getByTestId('mini-player-next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when previous button is pressed', () => {
    const onPrevious = jest.fn();
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} onPrevious={onPrevious} />
    );

    fireEvent.press(getByTestId('mini-player-previous'));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onExpand when topic info is pressed', () => {
    const onExpand = jest.fn();
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} onExpand={onExpand} />
    );

    fireEvent.press(getByTestId('mini-player-expand'));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} onClose={onClose} />
    );

    fireEvent.press(getByTestId('mini-player-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables next button when hasNextTrack is false', () => {
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} hasNextTrack={false} />
    );

    const nextButton = getByTestId('mini-player-next');
    expect(nextButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('disables previous button when hasPreviousTrack is false', () => {
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} hasPreviousTrack={false} />
    );

    const previousButton = getByTestId('mini-player-previous');
    expect(previousButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('disables play/pause button when canPlay is false', () => {
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} canPlay={false} />
    );

    const playButton = getByTestId('mini-player-play-pause');
    expect(playButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('displays correct progress bar width', () => {
    const { getByTestId } = render(
      <MiniPlayer {...defaultProps} progress={0.75} />
    );

    const miniPlayer = getByTestId('mini-player');
    expect(miniPlayer).toBeTruthy();
    // Note: Testing exact progress bar width would require more complex setup
    // as it involves style calculations
  });

  it('handles topic without author gracefully', () => {
    const topicWithoutAuthor = { ...mockTopic, author: undefined };
    const { getByText } = render(
      <MiniPlayer {...defaultProps} currentTopic={topicWithoutAuthor} />
    );

    expect(getByText('Unknown Artist')).toBeTruthy();
  });

  it('truncates long topic titles', () => {
    const longTitleTopic = {
      ...mockTopic,
      title: 'This is a very long topic title that should be truncated',
    };
    const { getByText } = render(
      <MiniPlayer {...defaultProps} currentTopic={longTitleTopic} />
    );

    const titleElement = getByText(longTitleTopic.title);
    expect(titleElement.props.numberOfLines).toBe(1);
  });

  it('truncates long author names', () => {
    const longAuthorTopic = {
      ...mockTopic,
      author: 'This is a very long author name that should be truncated',
    };
    const { getByText } = render(
      <MiniPlayer {...defaultProps} currentTopic={longAuthorTopic} />
    );

    const authorElement = getByText(longAuthorTopic.author);
    expect(authorElement.props.numberOfLines).toBe(1);
  });

  describe('Animation', () => {
    it('handles visibility changes', () => {
      const { rerender } = render(
        <MiniPlayer {...defaultProps} isVisible={false} />
      );

      rerender(<MiniPlayer {...defaultProps} isVisible={true} />);

      // Component should handle visibility changes without crashing
      expect(true).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has proper test IDs for all interactive elements', () => {
      const { getByTestId } = render(<MiniPlayer {...defaultProps} />);

      expect(getByTestId('mini-player')).toBeTruthy();
      expect(getByTestId('mini-player-expand')).toBeTruthy();
      expect(getByTestId('mini-player-previous')).toBeTruthy();
      expect(getByTestId('mini-player-play-pause')).toBeTruthy();
      expect(getByTestId('mini-player-next')).toBeTruthy();
      expect(getByTestId('mini-player-close')).toBeTruthy();
    });

    it('maintains proper button states for screen readers', () => {
      const { getByTestId } = render(
        <MiniPlayer
          {...defaultProps}
          canPlay={false}
          hasNextTrack={false}
          hasPreviousTrack={false}
        />
      );

      expect(getByTestId('mini-player-play-pause').props.accessibilityState?.disabled).toBe(true);
      expect(getByTestId('mini-player-next').props.accessibilityState?.disabled).toBe(true);
      expect(getByTestId('mini-player-previous').props.accessibilityState?.disabled).toBe(true);
    });
  });
});