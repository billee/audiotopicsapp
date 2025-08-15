/**
 * TopicRow component tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TopicRow from '../TopicRow';
import { AudioTopic } from '../../../types';
import { useInlineAudio } from '../../../contexts/InlineAudioContext';

// Mock the InlineAudioContext
jest.mock('../../../contexts/InlineAudioContext');
const mockUseInlineAudio = useInlineAudio as jest.MockedFunction<typeof useInlineAudio>;

// Mock the formatters utility
jest.mock('../../../utils/formatters', () => ({
    formatDuration: jest.fn((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }),
}));

// Mock InlineAudioControls component
jest.mock('../../audio/InlineAudioControls', () => {
    return function MockInlineAudioControls({
        playbackState,
        isActive,
        hasError,
        onPlay,
        onPause,
        onStop,
        onRetry,
        testID
    }: any) {
        return (
            <div testID={testID}>
                <button testID="mock-play-button" onPress={onPlay}>
                    {playbackState === 'playing' ? 'Pause' : 'Play'}
                </button>
                <button testID="mock-stop-button" onPress={onStop}>Stop</button>
                {hasError && (
                    <button testID="mock-retry-button" onPress={onRetry}>Retry</button>
                )}
                <span testID="mock-state">{playbackState}</span>
                <span testID="mock-active">{isActive ? 'active' : 'inactive'}</span>
            </div>
        );
    };
});

const mockTopic: AudioTopic = {
    id: 'test-topic-1',
    title: 'Test Topic Title for Inline Audio',
    description: 'This is a test topic for inline audio controls testing.',
    categoryId: 'test-category',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 1800, // 30 minutes
    metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 28800000,
    },
};

describe('TopicRow', () => {
    const mockActions = {
        playTopic: jest.fn(),
        pauseAudio: jest.fn(),
        stopAudio: jest.fn(),
        resetError: jest.fn(),
        isTopicPlaying: jest.fn(),
        isTopicPaused: jest.fn(),
        getCurrentTopic: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementation
        mockUseInlineAudio.mockReturnValue({
            state: {
                currentPlayingTopic: null,
                playbackState: 'idle',
                progress: {
                    currentPosition: 0,
                    duration: 0,
                    percentage: 0,
                },
                error: null,
            },
            actions: mockActions,
        });
    });

    describe('Basic Rendering', () => {
        it('renders topic information correctly', () => {
            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            expect(getByText('Test Topic Title for Inline Audio')).toBeTruthy();
            expect(getByText('30:00')).toBeTruthy(); // Duration formatted
            expect(getByTestId('topic-row')).toBeTruthy();
            expect(getByTestId('topic-row-title')).toBeTruthy();
            expect(getByTestId('topic-row-duration')).toBeTruthy();
        });

        it('renders with custom testID', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} testID="custom-topic-row" />
            );

            expect(getByTestId('custom-topic-row')).toBeTruthy();
        });

        it('applies custom styles', () => {
            const customStyle = { backgroundColor: 'red' };
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} style={customStyle} />
            );

            const container = getByTestId('topic-row');
            expect(container.props.style).toEqual(
                expect.arrayContaining([expect.objectContaining(customStyle)])
            );
        });
    });

    describe('Idle State', () => {
        it('shows default appearance when not playing', () => {
            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            expect(getByText('30:00')).toBeTruthy(); // Shows total duration
            expect(getByTestId('mock-state')).toHaveTextContent('idle');
            expect(getByTestId('mock-active')).toHaveTextContent('inactive');
        });

        it('does not show progress indicator when idle', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const progressIndicator = getByTestId('topic-row-progress-indicator');
            expect(progressIndicator.props.style).toEqual(
                expect.arrayContaining([expect.objectContaining({ width: 0 })])
            );
        });
    });

    describe('Playing State', () => {
        beforeEach(() => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'playing',
                    progress: {
                        currentPosition: 900, // 15 minutes
                        duration: 1800, // 30 minutes
                        percentage: 50,
                    },
                    error: null,
                },
                actions: mockActions,
            });
        });

        it('shows playing state correctly', () => {
            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            expect(getByText('♪ Playing')).toBeTruthy();
            expect(getByText('15:00 / 30:00')).toBeTruthy(); // Current / Total
            expect(getByTestId('mock-state')).toHaveTextContent('playing');
            expect(getByTestId('mock-active')).toHaveTextContent('active');
        });

        it('shows progress indicator when playing', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const progressIndicator = getByTestId('topic-row-progress-indicator');
            expect(progressIndicator.props.style).toEqual(
                expect.arrayContaining([expect.objectContaining({ width: '50%' })])
            );
        });

        it('applies playing container style', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const container = getByTestId('topic-row');
            expect(container.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        backgroundColor: '#F0F8FF',
                        borderWidth: 2,
                        borderColor: '#007AFF',
                    })
                ])
            );
        });

        it('shows active title styling', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const title = getByTestId('topic-row-title');
            expect(title.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        color: '#007AFF',
                        fontWeight: '700',
                    })
                ])
            );
        });
    });

    describe('Paused State', () => {
        beforeEach(() => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'paused',
                    progress: {
                        currentPosition: 600, // 10 minutes
                        duration: 1800, // 30 minutes
                        percentage: 33.33,
                    },
                    error: null,
                },
                actions: mockActions,
            });
        });

        it('shows paused state correctly', () => {
            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            expect(getByText('⏸ Paused')).toBeTruthy();
            expect(getByText('10:00 / 30:00')).toBeTruthy();
            expect(getByTestId('mock-state')).toHaveTextContent('paused');
        });

        it('applies paused container style', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const container = getByTestId('topic-row');
            expect(container.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        backgroundColor: '#FFF8F0',
                        borderWidth: 1,
                        borderColor: '#FF9500',
                    })
                ])
            );
        });
    });

    describe('Loading State', () => {
        beforeEach(() => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'loading',
                    progress: {
                        currentPosition: 0,
                        duration: 0,
                        percentage: 0,
                    },
                    error: null,
                },
                actions: mockActions,
            });
        });

        it('shows loading state correctly', () => {
            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            expect(getByText('⏳ Loading')).toBeTruthy();
            expect(getByTestId('mock-state')).toHaveTextContent('loading');
        });

        it('applies loading container style', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const container = getByTestId('topic-row');
            expect(container.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        backgroundColor: '#F8F8F8',
                        borderWidth: 1,
                        borderColor: '#C7C7CC',
                    })
                ])
            );
        });
    });

    describe('Error State', () => {
        beforeEach(() => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'error',
                    progress: {
                        currentPosition: 0,
                        duration: 0,
                        percentage: 0,
                    },
                    error: {
                        code: 'PLAY_ERROR',
                        message: 'Failed to play audio',
                        retryable: true,
                    },
                },
                actions: mockActions,
            });
        });

        it('shows error state correctly', () => {
            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            expect(getByText('⚠ Error')).toBeTruthy();
            expect(getByTestId('mock-retry-button')).toBeTruthy();
        });

        it('applies error container style', () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const container = getByTestId('topic-row');
            expect(container.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        backgroundColor: '#FFF0F0',
                        borderWidth: 2,
                        borderColor: '#FF6B6B',
                    })
                ])
            );
        });
    });

    describe('Audio Control Actions', () => {
        it('calls playTopic when play is triggered', async () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-play-button'));

            await waitFor(() => {
                expect(mockActions.playTopic).toHaveBeenCalledWith(mockTopic);
            });
        });

        it('calls pauseAudio when pause is triggered', async () => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'playing',
                    progress: { currentPosition: 0, duration: 0, percentage: 0 },
                    error: null,
                },
                actions: mockActions,
            });

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-play-button')); // Should be pause button when playing

            await waitFor(() => {
                expect(mockActions.pauseAudio).toHaveBeenCalled();
            });
        });

        it('calls stopAudio when stop is triggered', async () => {
            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-stop-button'));

            await waitFor(() => {
                expect(mockActions.stopAudio).toHaveBeenCalled();
            });
        });

        it('handles retry action correctly', async () => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'error',
                    progress: { currentPosition: 0, duration: 0, percentage: 0 },
                    error: { code: 'PLAY_ERROR', message: 'Failed', retryable: true },
                },
                actions: mockActions,
            });

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-retry-button'));

            await waitFor(() => {
                expect(mockActions.resetError).toHaveBeenCalled();
                expect(mockActions.playTopic).toHaveBeenCalledWith(mockTopic);
            });
        });
    });

    describe('Progress Calculation', () => {
        it('handles zero progress correctly', () => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'playing',
                    progress: {
                        currentPosition: 0,
                        duration: 1800,
                        percentage: 0,
                    },
                    error: null,
                },
                actions: mockActions,
            });

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const progressIndicator = getByTestId('topic-row-progress-indicator');
            expect(progressIndicator.props.style).toEqual(
                expect.arrayContaining([expect.objectContaining({ width: 0 })])
            );
        });

        it('limits progress to 100%', () => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'playing',
                    progress: {
                        currentPosition: 2000, // More than duration
                        duration: 1800,
                        percentage: 111, // Over 100%
                    },
                    error: null,
                },
                actions: mockActions,
            });

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            const progressIndicator = getByTestId('topic-row-progress-indicator');
            expect(progressIndicator.props.style).toEqual(
                expect.arrayContaining([expect.objectContaining({ width: '100%' })])
            );
        });
    });

    describe('Error Handling', () => {
        it('handles play action errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockActions.playTopic.mockRejectedValue(new Error('Play failed'));

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-play-button'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'TopicRow: Failed to play topic:',
                    expect.any(Error)
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it('handles pause action errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockActions.pauseAudio.mockRejectedValue(new Error('Pause failed'));

            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'test-topic-1',
                    playbackState: 'playing',
                    progress: { currentPosition: 0, duration: 0, percentage: 0 },
                    error: null,
                },
                actions: mockActions,
            });

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-play-button'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'TopicRow: Failed to pause audio:',
                    expect.any(Error)
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it('handles stop action errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockActions.stopAudio.mockRejectedValue(new Error('Stop failed'));

            const { getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            fireEvent.press(getByTestId('mock-stop-button'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'TopicRow: Failed to stop audio:',
                    expect.any(Error)
                );
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Different Topics', () => {
        it('shows inactive state for different topic when another is playing', () => {
            mockUseInlineAudio.mockReturnValue({
                state: {
                    currentPlayingTopic: 'different-topic-id',
                    playbackState: 'playing',
                    progress: { currentPosition: 100, duration: 200, percentage: 50 },
                    error: null,
                },
                actions: mockActions,
            });

            const { getByText, getByTestId } = render(
                <TopicRow topic={mockTopic} />
            );

            // Should show default duration, not current/total
            expect(getByText('30:00')).toBeTruthy();
            expect(getByTestId('mock-state')).toHaveTextContent('idle');
            expect(getByTestId('mock-active')).toHaveTextContent('inactive');
        });
    });
});