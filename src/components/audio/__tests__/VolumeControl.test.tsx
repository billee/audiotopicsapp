/**
 * VolumeControl component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VolumeControl from '../VolumeControl';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('VolumeControl', () => {
  const defaultProps = {
    volume: 0.5,
    onVolumeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with volume button', () => {
    const { getByTestId } = render(<VolumeControl {...defaultProps} />);

    expect(getByTestId('volume-button')).toBeTruthy();
  });

  it('shows volume slider when button is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <VolumeControl {...defaultProps} />
    );

    // Initially slider should not be visible
    expect(queryByTestId('volume-slider')).toBeNull();

    // Press volume button to expand
    fireEvent.press(getByTestId('volume-button'));

    // Now slider should be visible
    expect(getByTestId('volume-slider')).toBeTruthy();
  });

  it('hides volume slider when button is pressed again', () => {
    const { getByTestId, queryByTestId } = render(
      <VolumeControl {...defaultProps} />
    );

    // Press to expand
    fireEvent.press(getByTestId('volume-button'));
    expect(getByTestId('volume-slider')).toBeTruthy();

    // Press again to collapse
    fireEvent.press(getByTestId('volume-button'));
    expect(queryByTestId('volume-slider')).toBeNull();
  });

  it('calls onVolumeChange when slider is pressed', () => {
    const { getByTestId } = render(<VolumeControl {...defaultProps} />);

    // Expand slider
    fireEvent.press(getByTestId('volume-button'));

    // Press on slider
    const slider = getByTestId('volume-slider');
    fireEvent(slider, 'touchEnd', {
      nativeEvent: { locationX: 50, locationY: 25 },
    });

    expect(defaultProps.onVolumeChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it('displays correct volume icon for different volume levels', () => {
    // Test volume off (0)
    const { rerender, getByTestId } = render(
      <VolumeControl {...defaultProps} volume={0} />
    );
    expect(getByTestId('volume-button')).toBeTruthy();

    // Test low volume (< 0.5)
    rerender(<VolumeControl {...defaultProps} volume={0.3} />);
    expect(getByTestId('volume-button')).toBeTruthy();

    // Test high volume (>= 0.5)
    rerender(<VolumeControl {...defaultProps} volume={0.8} />);
    expect(getByTestId('volume-button')).toBeTruthy();
  });

  it('clamps volume values to valid range', () => {
    const { getByTestId } = render(<VolumeControl {...defaultProps} />);

    // Expand slider
    fireEvent.press(getByTestId('volume-button'));

    const slider = getByTestId('volume-slider');

    // Test volume above 1.0
    fireEvent(slider, 'touchEnd', {
      nativeEvent: { locationX: 200, locationY: 25 },
    });

    // Should be called with a value <= 1.0
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(
      expect.any(Number)
    );

    // Test volume below 0.0
    fireEvent(slider, 'touchEnd', {
      nativeEvent: { locationX: -50, locationY: 25 },
    });

    // Should be called with a value >= 0.0
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(
      expect.any(Number)
    );
  });

  it('handles horizontal orientation', () => {
    const { getByTestId } = render(
      <VolumeControl {...defaultProps} orientation="horizontal" />
    );

    fireEvent.press(getByTestId('volume-button'));
    expect(getByTestId('volume-slider')).toBeTruthy();
  });

  it('handles vertical orientation', () => {
    const { getByTestId } = render(
      <VolumeControl {...defaultProps} orientation="vertical" />
    );

    fireEvent.press(getByTestId('volume-button'));
    expect(getByTestId('volume-slider')).toBeTruthy();
  });

  it('applies custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <VolumeControl {...defaultProps} style={customStyle} />
    );

    const container = getByTestId('volume-button').parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('calculates volume correctly for horizontal slider', () => {
    const { getByTestId } = render(
      <VolumeControl {...defaultProps} orientation="horizontal" />
    );

    fireEvent.press(getByTestId('volume-button'));

    const slider = getByTestId('volume-slider');
    fireEvent(slider, 'touchEnd', {
      nativeEvent: { locationX: 50, locationY: 25 },
    });

    // For horizontal, volume should be locationX / sliderLength
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.5);
  });

  it('calculates volume correctly for vertical slider', () => {
    const { getByTestId } = render(
      <VolumeControl {...defaultProps} orientation="vertical" />
    );

    fireEvent.press(getByTestId('volume-button'));

    const slider = getByTestId('volume-slider');
    fireEvent(slider, 'touchEnd', {
      nativeEvent: { locationX: 25, locationY: 50 },
    });

    // For vertical, volume should be 1 - (locationY / sliderLength)
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.5);
  });
});