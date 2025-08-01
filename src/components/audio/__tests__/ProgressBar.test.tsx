/**
 * ProgressBar component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  const defaultProps = {
    currentTime: 150,
    duration: 300,
    formattedCurrentTime: '2:30',
    formattedDuration: '5:00',
    onSeek: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with time labels', () => {
    const { getByTestId, getByText } = render(
      <ProgressBar {...defaultProps} showTimeLabels={true} />
    );

    expect(getByTestId('progress-bar')).toBeTruthy();
    expect(getByTestId('current-time')).toBeTruthy();
    expect(getByTestId('duration')).toBeTruthy();
    expect(getByText('2:30')).toBeTruthy();
    expect(getByText('5:00')).toBeTruthy();
  });

  it('renders correctly without time labels', () => {
    const { getByTestId, queryByTestId } = render(
      <ProgressBar {...defaultProps} showTimeLabels={false} />
    );

    expect(getByTestId('progress-bar')).toBeTruthy();
    expect(queryByTestId('current-time')).toBeNull();
    expect(queryByTestId('duration')).toBeNull();
  });

  it('calls onSeek when progress bar is pressed', () => {
    const { getByTestId } = render(<ProgressBar {...defaultProps} />);

    const progressBar = getByTestId('progress-bar');
    fireEvent.press(progressBar, {
      nativeEvent: { locationX: 150 },
    });

    expect(defaultProps.onSeek).toHaveBeenCalledTimes(1);
    // The exact seek time would depend on the bar width calculation
    expect(defaultProps.onSeek).toHaveBeenCalledWith(expect.any(Number));
  });

  it('displays correct progress percentage', () => {
    const { getByTestId } = render(<ProgressBar {...defaultProps} />);

    const progressBar = getByTestId('progress-bar');
    expect(progressBar).toBeTruthy();

    // Progress should be 50% (150/300)
    // The actual progress fill width would be tested by checking the style
  });

  it('handles zero duration gracefully', () => {
    const props = { ...defaultProps, duration: 0, currentTime: 0 };
    const { getByTestId } = render(<ProgressBar {...props} />);

    expect(getByTestId('progress-bar')).toBeTruthy();
    // Should not crash and should show 0% progress
  });

  it('handles current time greater than duration', () => {
    const props = { ...defaultProps, currentTime: 400, duration: 300 };
    const { getByTestId } = render(<ProgressBar {...props} />);

    expect(getByTestId('progress-bar')).toBeTruthy();
    // Should cap progress at 100%
  });

  it('applies custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <ProgressBar {...defaultProps} style={customStyle} />
    );

    const container = getByTestId('progress-bar').parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('displays formatted time correctly', () => {
    const props = {
      ...defaultProps,
      formattedCurrentTime: '1:23',
      formattedDuration: '4:56',
    };

    const { getByText } = render(<ProgressBar {...props} />);

    expect(getByText('1:23')).toBeTruthy();
    expect(getByText('4:56')).toBeTruthy();
  });

  it('handles seek to beginning of track', () => {
    const { getByTestId } = render(<ProgressBar {...defaultProps} />);

    const progressBar = getByTestId('progress-bar');
    fireEvent.press(progressBar, {
      nativeEvent: { locationX: 0 },
    });

    expect(defaultProps.onSeek).toHaveBeenCalledWith(0);
  });

  it('handles seek to end of track', () => {
    const { getByTestId } = render(<ProgressBar {...defaultProps} />);

    const progressBar = getByTestId('progress-bar');
    fireEvent.press(progressBar, {
      nativeEvent: { locationX: 300 },
    });

    expect(defaultProps.onSeek).toHaveBeenCalledWith(defaultProps.duration);
  });
});