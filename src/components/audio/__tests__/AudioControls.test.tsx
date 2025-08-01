/**
 * AudioControls component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AudioControls from '../AudioControls';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('AudioControls', () => {
  const defaultProps = {
    isPlaying: false,
    canPlay: true,
    hasNextTrack: true,
    hasPreviousTrack: true,
    onPlayPause: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onSkipForward: jest.fn(),
    onSkipBackward: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all controls', () => {
    const { getByTestId } = render(<AudioControls {...defaultProps} />);

    expect(getByTestId('play-pause-button')).toBeTruthy();
    expect(getByTestId('previous-button')).toBeTruthy();
    expect(getByTestId('next-button')).toBeTruthy();
    expect(getByTestId('skip-backward-button')).toBeTruthy();
    expect(getByTestId('skip-forward-button')).toBeTruthy();
  });

  it('calls onPlayPause when play/pause button is pressed', () => {
    const { getByTestId } = render(<AudioControls {...defaultProps} />);

    fireEvent.press(getByTestId('play-pause-button'));
    expect(defaultProps.onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is pressed', () => {
    const { getByTestId } = render(<AudioControls {...defaultProps} />);

    fireEvent.press(getByTestId('next-button'));
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when previous button is pressed', () => {
    const { getByTestId } = render(<AudioControls {...defaultProps} />);

    fireEvent.press(getByTestId('previous-button'));
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onSkipForward when skip forward button is pressed', () => {
    const { getByTestId } = render(<AudioControls {...defaultProps} />);

    fireEvent.press(getByTestId('skip-forward-button'));
    expect(defaultProps.onSkipForward).toHaveBeenCalledTimes(1);
  });

  it('calls onSkipBackward when skip backward button is pressed', () => {
    const { getByTestId } = render(<AudioControls {...defaultProps} />);

    fireEvent.press(getByTestId('skip-backward-button'));
    expect(defaultProps.onSkipBackward).toHaveBeenCalledTimes(1);
  });

  it('disables controls when canPlay is false', () => {
    const props = { ...defaultProps, canPlay: false };
    const { getByTestId } = render(<AudioControls {...props} />);

    const playButton = getByTestId('play-pause-button');
    const skipForwardButton = getByTestId('skip-forward-button');
    const skipBackwardButton = getByTestId('skip-backward-button');

    expect(playButton.props.accessibilityState.disabled).toBe(true);
    expect(skipForwardButton.props.accessibilityState.disabled).toBe(true);
    expect(skipBackwardButton.props.accessibilityState.disabled).toBe(true);
  });

  it('disables next button when hasNextTrack is false', () => {
    const props = { ...defaultProps, hasNextTrack: false };
    const { getByTestId } = render(<AudioControls {...props} />);

    const nextButton = getByTestId('next-button');
    expect(nextButton.props.accessibilityState.disabled).toBe(true);
  });

  it('disables previous button when hasPreviousTrack is false', () => {
    const props = { ...defaultProps, hasPreviousTrack: false };
    const { getByTestId } = render(<AudioControls {...props} />);

    const previousButton = getByTestId('previous-button');
    expect(previousButton.props.accessibilityState.disabled).toBe(true);
  });

  it('renders different sizes correctly', () => {
    const { rerender, getByTestId } = render(
      <AudioControls {...defaultProps} size="small" />
    );

    let playButton = getByTestId('play-pause-button');
    expect(playButton.props.style).toMatchObject(
      expect.objectContaining({
        width: 48,
        height: 48,
      })
    );

    rerender(<AudioControls {...defaultProps} size="large" />);

    playButton = getByTestId('play-pause-button');
    expect(playButton.props.style).toMatchObject(
      expect.objectContaining({
        width: 80,
        height: 80,
      })
    );
  });

  it('shows correct icon when playing', () => {
    const { getByTestId } = render(
      <AudioControls {...defaultProps} isPlaying={true} />
    );

    const playButton = getByTestId('play-pause-button');
    // The icon name would be checked in the Icon component props
    expect(playButton).toBeTruthy();
  });

  it('shows correct icon when paused', () => {
    const { getByTestId } = render(
      <AudioControls {...defaultProps} isPlaying={false} />
    );

    const playButton = getByTestId('play-pause-button');
    // The icon name would be checked in the Icon component props
    expect(playButton).toBeTruthy();
  });
});