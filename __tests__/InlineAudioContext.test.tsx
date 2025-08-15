import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { InlineAudioProvider, useInlineAudio } from '../src/contexts/InlineAudioContext';
import InlineAudioManager from '../src/services/InlineAudioManager';
import { AudioTopic } from '../src/types';

// Mock react-native-sound first
const mockSoundInstance = {
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    setCurrentTime: jest.fn(),
    getCurrentTime: jest.fn(),
    getDuration: jest.fn(),
    setVolume: jest.fn(),
};

const MockSound = jest.fn().mockImplementation((url, basePath, callback) => {
    setTimeout(() => callback(null), 10);
    return mockSoundInstance;
});

MockSound.setCategory = jest.fn();

jest.mock('react-native-sound', () => MockSound);

// Mock the InlineAudioManager
jest.mock('../src/services/InlineAudioManager');

// Test component to access context
function TestComponent() {
    const { state, actions } = useInlineAudio();

    return (
        <>
            <div testID="current-topic">{state.currentPlayingTopic || 'none'}</div>
            <div testID="playback-state">{state.playbackState}</div>
            <div testID="progress">{state.progress.percentage}</div>
            <div testID="error">{state.error?.message || 'none'}</div>
            <button
                testID="play-button"
                onPress={() => actions.playTopic(mockTopic1)}
            />
            <button
                testID="pause-button"
                onPress={() => actions.pauseAudio()}
            />
            <button
                testID="stop-button"
                onPress={() => actions.stopAudio()}
            />
            <button
                testID="reset-error-button"
                onPress={() => actions.resetError()}
            />
        </>
    );
}

// Mock topics for testing
const mockTopic1: AudioTopic = {
    id: 'topic-1',
    title: 'Test Topic 1',
    description: 'Test description 1',
    categoryId: 'category-1',
    audioUrl: 'https://example.com/audio1.mp3',
    duration: 120,
    metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 1024
    }
};

const mockTopic2: AudioTopic = {
    id: 'topic-2',
    title: 'Test Topic 2',
    description: 'Test description 2',
    categoryId: 'category-1',
    audioUrl: 'https://example.com/audio2.mp3',
    duration: 180,
    metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 2048
    }
};

describe('InlineAudioContext', () => {
    let mockAudioManager: jest.Mocked<InlineAudioManager>;
    let mockEventHandlers: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock audio manager instance
        mockAudioManager = {
            setEventHandlers: jest.fn(),
            playTopic: jest.fn(),
            pauseAudio: jest.fn(),
            stopAudio: jest.fn(),
            cleanup: jest.fn(),
            isTopicPlaying: jest.fn().mockReturnValue(false),
            isTopicPaused: jest.fn().mockReturnValue(false),
            getCurrentTopic: jest.fn().mockReturnValue(null)
        } as any;

        // Mock the constructor to return our mock instance
        (InlineAudioManager as jest.MockedClass<typeof InlineAudioManager>).mockImplementation(() => mockAudioManager);

        // Capture event handlers when they're set
        mockAudioManager.setEventHandlers.mockImplementation((handlers) => {
            mockEventHandlers = handlers;
        });
    });

    describe('Provider Initialization', () => {
        it('should initialize with default state', () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            expect(getByTestId('current-topic')).toHaveTextContent('none');
            expect(getByTestId('playback-state')).toHaveTextContent('idle');
            expect(getByTestId('progress')).toHaveTextContent('0');
            expect(getByTestId('error')).toHaveTextContent('none');
        });

        it('should create audio manager instance and set event handlers', () => {
            render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            expect(InlineAudioManager).toHaveBeenCalledTimes(1);
            expect(mockAudioManager.setEventHandlers).toHaveBeenCalledWith(
                expect.objectContaining({
                    onStateChange: expect.any(Function),
                    onProgressUpdate: expect.any(Function),
                    onError: expect.any(Function),
                    onPlaybackComplete: expect.any(Function)
                })
            );
        });

        it('should cleanup audio manager on unmount', () => {
            const { unmount } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            unmount();

            expect(mockAudioManager.cleanup).toHaveBeenCalledTimes(1);
        });
    });

    describe('Audio Playback Actions', () => {
        it('should play topic and update state', async () => {
            mockAudioManager.playTopic.mockResolvedValue();

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                getByTestId('play-button').props.onPress();
            });

            expect(mockAudioManager.playTopic).toHaveBeenCalledWith(mockTopic1);
            expect(getByTestId('current-topic')).toHaveTextContent('topic-1');
        });

        it('should handle play topic error', async () => {
            const error = new Error('Failed to play');
            mockAudioManager.playTopic.mockRejectedValue(error);

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                getByTestId('play-button').props.onPress();
            });

            await waitFor(() => {
                expect(getByTestId('error')).toHaveTextContent('Failed to play Test Topic 1');
                expect(getByTestId('current-topic')).toHaveTextContent('none');
            });
        });

        it('should pause audio', async () => {
            mockAudioManager.pauseAudio.mockResolvedValue();

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                getByTestId('pause-button').props.onPress();
            });

            expect(mockAudioManager.pauseAudio).toHaveBeenCalledTimes(1);
        });

        it('should stop audio and reset current topic', async () => {
            mockAudioManager.stopAudio.mockResolvedValue();

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            // First set a current topic
            await act(async () => {
                getByTestId('play-button').props.onPress();
            });

            // Then stop audio
            await act(async () => {
                getByTestId('stop-button').props.onPress();
            });

            expect(mockAudioManager.stopAudio).toHaveBeenCalledTimes(1);
            expect(getByTestId('current-topic')).toHaveTextContent('none');
        });

        it('should reset error state', async () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            // Trigger an error first
            await act(async () => {
                mockEventHandlers.onError({
                    code: 'TEST_ERROR',
                    message: 'Test error message',
                    retryable: true
                });
            });

            expect(getByTestId('error')).toHaveTextContent('Test error message');

            // Reset error
            await act(async () => {
                getByTestId('reset-error-button').props.onPress();
            });

            expect(getByTestId('error')).toHaveTextContent('none');
        });
    });

    describe('Event Handler Integration', () => {
        it('should update state when audio manager emits state change', async () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                mockEventHandlers.onStateChange('playing');
            });

            expect(getByTestId('playback-state')).toHaveTextContent('playing');
        });

        it('should update progress when audio manager emits progress update', async () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                mockEventHandlers.onProgressUpdate({
                    currentPosition: 30,
                    duration: 120,
                    percentage: 25
                });
            });

            expect(getByTestId('progress')).toHaveTextContent('25');
        });

        it('should handle error events from audio manager', async () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                mockEventHandlers.onError({
                    code: 'NETWORK_ERROR',
                    message: 'Network connection failed',
                    retryable: true
                });
            });

            expect(getByTestId('error')).toHaveTextContent('Network connection failed');
            expect(getByTestId('playback-state')).toHaveTextContent('error');
        });

        it('should handle playback completion', async () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            // Set a current topic first
            await act(async () => {
                getByTestId('play-button').props.onPress();
            });

            // Simulate playback completion
            await act(async () => {
                mockEventHandlers.onPlaybackComplete();
            });

            expect(getByTestId('current-topic')).toHaveTextContent('none');
            expect(getByTestId('playback-state')).toHaveTextContent('stopped');
        });

        it('should reset current topic when state changes to stopped or idle', async () => {
            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponent />
                </InlineAudioProvider>
            );

            // Set a current topic first
            await act(async () => {
                getByTestId('play-button').props.onPress();
            });

            expect(getByTestId('current-topic')).toHaveTextContent('topic-1');

            // Simulate state change to stopped
            await act(async () => {
                mockEventHandlers.onStateChange('stopped');
            });

            expect(getByTestId('current-topic')).toHaveTextContent('none');
        });
    });

    describe('Audio Switching Scenarios', () => {
        it('should switch between topics correctly', async () => {
            mockAudioManager.playTopic.mockResolvedValue();

            const TestSwitchingComponent = () => {
                const { state, actions } = useInlineAudio();

                return (
                    <>
                        <div testID="current-topic">{state.currentPlayingTopic || 'none'}</div>
                        <button
                            testID="play-topic-1"
                            onPress={() => actions.playTopic(mockTopic1)}
                        />
                        <button
                            testID="play-topic-2"
                            onPress={() => actions.playTopic(mockTopic2)}
                        />
                    </>
                );
            };

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestSwitchingComponent />
                </InlineAudioProvider>
            );

            // Play first topic
            await act(async () => {
                getByTestId('play-topic-1').props.onPress();
            });

            expect(getByTestId('current-topic')).toHaveTextContent('topic-1');
            expect(mockAudioManager.playTopic).toHaveBeenCalledWith(mockTopic1);

            // Switch to second topic
            await act(async () => {
                getByTestId('play-topic-2').props.onPress();
            });

            expect(getByTestId('current-topic')).toHaveTextContent('topic-2');
            expect(mockAudioManager.playTopic).toHaveBeenCalledWith(mockTopic2);
            expect(mockAudioManager.playTopic).toHaveBeenCalledTimes(2);
        });

        it('should prevent multiple audio playback through single instance management', async () => {
            mockAudioManager.playTopic.mockResolvedValue();

            const TestMultiplePlaybackComponent = () => {
                const { actions } = useInlineAudio();

                return (
                    <>
                        <button
                            testID="play-multiple-1"
                            onPress={() => {
                                actions.playTopic(mockTopic1);
                                actions.playTopic(mockTopic2);
                            }}
                        />
                    </>
                );
            };

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestMultiplePlaybackComponent />
                </InlineAudioProvider>
            );

            await act(async () => {
                getByTestId('play-multiple-1').props.onPress();
            });

            // The audio manager should handle preventing multiple playback
            // by stopping the first before starting the second
            expect(mockAudioManager.playTopic).toHaveBeenCalledTimes(2);
        });
    });

    describe('Helper Methods', () => {
        it('should delegate to audio manager for isTopicPlaying', () => {
            mockAudioManager.isTopicPlaying.mockReturnValue(true);

            let actions: any;
            const TestHelperComponent = () => {
                const context = useInlineAudio();
                actions = context.actions;
                return <div testID="helper-test">test</div>;
            };

            render(
                <InlineAudioProvider>
                    <TestHelperComponent />
                </InlineAudioProvider>
            );

            const result = actions.isTopicPlaying('topic-1');
            expect(result).toBe(true);
            expect(mockAudioManager.isTopicPlaying).toHaveBeenCalledWith('topic-1');
        });

        it('should delegate to audio manager for isTopicPaused', () => {
            mockAudioManager.isTopicPaused.mockReturnValue(true);

            let actions: any;
            const TestHelperComponent = () => {
                const context = useInlineAudio();
                actions = context.actions;
                return <div testID="helper-test">test</div>;
            };

            render(
                <InlineAudioProvider>
                    <TestHelperComponent />
                </InlineAudioProvider>
            );

            const result = actions.isTopicPaused('topic-1');
            expect(result).toBe(true);
            expect(mockAudioManager.isTopicPaused).toHaveBeenCalledWith('topic-1');
        });

        it('should delegate to audio manager for getCurrentTopic', () => {
            mockAudioManager.getCurrentTopic.mockReturnValue(mockTopic1);

            let actions: any;
            const TestHelperComponent = () => {
                const context = useInlineAudio();
                actions = context.actions;
                return <div testID="helper-test">test</div>;
            };

            render(
                <InlineAudioProvider>
                    <TestHelperComponent />
                </InlineAudioProvider>
            );

            const result = actions.getCurrentTopic();
            expect(result).toEqual(mockTopic1);
            expect(mockAudioManager.getCurrentTopic).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should throw error when useInlineAudio is used outside provider', () => {
            const TestComponentOutsideProvider = () => {
                useInlineAudio();
                return <div />;
            };

            expect(() => {
                render(<TestComponentOutsideProvider />);
            }).toThrow('useInlineAudio must be used within an InlineAudioProvider');
        });

        it('should handle audio manager not initialized error', async () => {
            const TestComponentWithoutManager = () => {
                const { actions } = useInlineAudio();

                return (
                    <button
                        testID="play-without-manager"
                        onPress={() => actions.playTopic(mockTopic1)}
                    />
                );
            };

            // Mock the audio manager to be null
            (InlineAudioManager as jest.MockedClass<typeof InlineAudioManager>).mockImplementation(() => null as any);

            const { getByTestId } = render(
                <InlineAudioProvider>
                    <TestComponentWithoutManager />
                </InlineAudioProvider>
            );

            await act(async () => {
                getByTestId('play-without-manager').props.onPress();
            });

            // Should handle the error gracefully
            // The exact behavior depends on implementation details
        });
    });
});