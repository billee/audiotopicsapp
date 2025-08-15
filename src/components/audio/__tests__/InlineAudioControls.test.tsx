/**
 * InlineAudioControls component tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import InlineAudioControls from '../InlineAudioControls';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Note: Haptics testing removed since expo-haptics is not available in this environment

describe('InlineAudioControls', () => {
    const defaultProps = {
        playbackState: 'idle' as const,
        isActive: false,
        hasError: false,
        onPlay: jest.fn(),
        onPause: jest.fn(),
        onStop: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders correctly with default props', () => {
            const { getByTestId } = render(<InlineAudioControls {...defaultProps} />);

            expect(getByTestId('inline-audio-controls')).toBeTruthy();
            expect(getByTestId('play-button')).toBeTruthy();
        });

        it('renders with custom style', () => {
            const customStyle = { backgroundColor: 'red' };
            const { getByTestId } = render(
                <InlineAudioControls {...defaultProps} style={customStyle} />
            );

            const container = getByTestId('inline-audio-controls');
            expect(container.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(customStyle)
                ])
            );
        });

        it('renders different sizes correctly', () => {
            const { rerender, getByTestId } = render(
                <InlineAudioControls {...defaultProps} size="small" />
            );

            let playButton = getByTestId('play-button');
            expect(playButton.props.style).toEqual(
                expect.objectContaining({
                    width: 36,
                    height: 36,
                })
            );

            rerender(<InlineAudioControls {...defaultProps} size="large" />);

            playButton = getByTestId('play-button');
            expect(playButton.props.style).toEqual(
                expect.objectContaining({
                    width: 56,
                    height: 56,
                })
            );
        });
    });

    describe('Play/Pause Button States', () => {
        it('shows play button when idle', () => {
            const { getByTestId, queryByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="idle" />
            );

            expect(getByTestId('play-button')).toBeTruthy();
            expect(queryByTestId('pause-button')).toBeNull();
        });

        it('shows pause button when playing', () => {
            const { getByTestId, queryByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                />
            );

            expect(getByTestId('pause-button')).toBeTruthy();
            expect(queryByTestId('play-button')).toBeNull();
        });

        it('shows play button when paused', () => {
            const { getByTestId, queryByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="paused"
                    isActive={true}
                />
            );

            expect(getByTestId('play-button')).toBeTruthy();
            expect(queryByTestId('pause-button')).toBeNull();
        });

        it('shows loading indicator when loading', () => {
            const { getByTestId, queryByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="loading" />
            );

            expect(getByTestId('main-button-loading')).toBeTruthy();
            expect(getByTestId('loading-indicator')).toBeTruthy();
            expect(queryByTestId('play-button')).toBeNull();
            expect(queryByTestId('pause-button')).toBeNull();
        });

        it('shows retry button when error', () => {
            const { getByTestId, queryByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="error" />
            );

            expect(getByTestId('retry-button')).toBeTruthy();
            expect(queryByTestId('play-button')).toBeNull();
            expect(queryByTestId('pause-button')).toBeNull();
        });

        it('shows retry button when hasError is true', () => {
            const { getByTestId } = render(
                <InlineAudioControls {...defaultProps} hasError={true} />
            );

            expect(getByTestId('retry-button')).toBeTruthy();
        });
    });

    describe('Stop Button Visibility', () => {
        it('does not show stop button when idle', () => {
            const { queryByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="idle" />
            );

            expect(queryByTestId('stop-button')).toBeNull();
        });

        it('does not show stop button when stopped', () => {
            const { queryByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="stopped" />
            );

            expect(queryByTestId('stop-button')).toBeNull();
        });

        it('shows stop button when playing and active', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                />
            );

            expect(getByTestId('stop-button')).toBeTruthy();
        });

        it('shows stop button when paused and active', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="paused"
                    isActive={true}
                />
            );

            expect(getByTestId('stop-button')).toBeTruthy();
        });

        it('shows stop button when loading and active', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="loading"
                    isActive={true}
                />
            );

            expect(getByTestId('stop-button')).toBeTruthy();
        });
    });

    describe('Button Interactions', () => {
        it('calls onPlay when play button is pressed', async () => {
            const onPlay = jest.fn();
            const { getByTestId } = render(
                <InlineAudioControls {...defaultProps} onPlay={onPlay} />
            );

            fireEvent.press(getByTestId('play-button'));

            await waitFor(() => {
                expect(onPlay).toHaveBeenCalledTimes(1);
            });
        });

        it('calls onPause when pause button is pressed', async () => {
            const onPause = jest.fn();
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                    onPause={onPause}
                />
            );

            fireEvent.press(getByTestId('pause-button'));

            await waitFor(() => {
                expect(onPause).toHaveBeenCalledTimes(1);
            });
        });

        it('calls onStop when stop button is pressed', async () => {
            const onStop = jest.fn();
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                    onStop={onStop}
                />
            );

            fireEvent.press(getByTestId('stop-button'));

            await waitFor(() => {
                expect(onStop).toHaveBeenCalledTimes(1);
            });
        });

        it('calls onRetry when retry button is pressed', async () => {
            const onRetry = jest.fn();
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="error"
                    onRetry={onRetry}
                />
            );

            fireEvent.press(getByTestId('retry-button'));

            await waitFor(() => {
                expect(onRetry).toHaveBeenCalledTimes(1);
            });
        });

        it('calls onPlay when retry button is pressed without onRetry handler', async () => {
            const onPlay = jest.fn();
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="error"
                    onPlay={onPlay}
                />
            );

            fireEvent.press(getByTestId('retry-button'));

            await waitFor(() => {
                expect(onPlay).toHaveBeenCalledTimes(1);
            });
        });

        it('does not call handlers when loading button is pressed', () => {
            const onPlay = jest.fn();
            const onPause = jest.fn();
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="loading"
                    onPlay={onPlay}
                    onPause={onPause}
                />
            );

            fireEvent.press(getByTestId('main-button-loading'));

            expect(onPlay).not.toHaveBeenCalled();
            expect(onPause).not.toHaveBeenCalled();
        });
    });

    // Note: Haptic feedback tests removed since expo-haptics is not available

    describe('Accessibility', () => {
        it('has proper accessibility labels for play button', () => {
            const { getByTestId } = render(<InlineAudioControls {...defaultProps} />);

            const playButton = getByTestId('play-button');
            expect(playButton.props.accessibilityLabel).toBe('Play audio');
            expect(playButton.props.accessibilityRole).toBe('button');
            expect(playButton.props.accessibilityHint).toBe('Double tap to play the audio');
        });

        it('has proper accessibility labels for pause button', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                />
            );

            const pauseButton = getByTestId('pause-button');
            expect(pauseButton.props.accessibilityLabel).toBe('Pause audio');
            expect(pauseButton.props.accessibilityRole).toBe('button');
            expect(pauseButton.props.accessibilityHint).toBe('Double tap to pause the audio');
        });

        it('has proper accessibility labels for stop button', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                />
            );

            const stopButton = getByTestId('stop-button');
            expect(stopButton.props.accessibilityLabel).toBe('Stop audio');
            expect(stopButton.props.accessibilityRole).toBe('button');
            expect(stopButton.props.accessibilityHint).toBe('Double tap to stop the audio');
        });

        it('has proper accessibility labels for retry button', () => {
            const { getByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="error" />
            );

            const retryButton = getByTestId('retry-button');
            expect(retryButton.props.accessibilityLabel).toBe('Retry playing audio');
            expect(retryButton.props.accessibilityRole).toBe('button');
            expect(retryButton.props.accessibilityHint).toBe('Double tap to retry playing the audio');
        });

        it('has proper accessibility state for loading button', () => {
            const { getByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="loading" />
            );

            const loadingButton = getByTestId('main-button-loading');
            expect(loadingButton.props.accessibilityLabel).toBe('Loading audio');
            expect(loadingButton.props.accessibilityRole).toBe('button');
            expect(loadingButton.props.accessibilityState.disabled).toBe(true);
        });
    });

    describe('Visual State Changes', () => {
        it('applies active button style when playing', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                />
            );

            const pauseButton = getByTestId('pause-button');
            expect(pauseButton.props.style).toEqual(
                expect.objectContaining({
                    backgroundColor: '#007AFF',
                })
            );
        });

        it('applies error button style when error', () => {
            const { getByTestId } = render(
                <InlineAudioControls {...defaultProps} playbackState="error" />
            );

            const retryButton = getByTestId('retry-button');
            expect(retryButton.props.style).toEqual(
                expect.objectContaining({
                    backgroundColor: '#FF6B6B',
                })
            );
        });

        it('applies secondary button style to stop button', () => {
            const { getByTestId } = render(
                <InlineAudioControls
                    {...defaultProps}
                    playbackState="playing"
                    isActive={true}
                />
            );

            const stopButton = getByTestId('stop-button');
            expect(stopButton.props.style).toEqual(
                expect.objectContaining({
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                })
            );
        });
    });
});