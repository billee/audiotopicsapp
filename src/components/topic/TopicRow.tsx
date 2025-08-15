/**
 * TopicRow component - Individual topic display with inline audio controls
 * Integrates InlineAudioControls for direct playback from topic list
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    Platform,
} from 'react-native';
import { AudioTopic } from '../../types';
import InlineAudioControls from '../audio/InlineAudioControls';
import { useInlineAudio } from '../../contexts/InlineAudioContext';
import { formatDuration } from '../../utils/formatters';

export interface TopicRowProps {
    /** The topic to display */
    topic: AudioTopic;
    /** Custom style override */
    style?: ViewStyle;
    /** Test ID for testing */
    testID?: string;
}

const TopicRow: React.FC<TopicRowProps> = ({
    topic,
    style,
    testID = 'topic-row',
}) => {
    const { state, actions } = useInlineAudio();

    // Simplified: always show basic UI, enhance only for current topic
    const isCurrentTopic = state.currentPlayingTopic === topic.id;

    const playbackState = isCurrentTopic ? state.playbackState : 'idle';
    const progress = isCurrentTopic ? state.progress : { currentPosition: 0, duration: 0, percentage: 0 };
    const hasError = isCurrentTopic && state.error !== null;





    // Handle play action
    const handlePlay = async () => {
        try {
            await actions.playTopic(topic);
        } catch (error) {
            console.error('TopicRow: Failed to play topic:', error);
        }
    };

    // Handle pause action
    const handlePause = async () => {
        try {
            await actions.pauseAudio();
        } catch (error) {
            console.error('TopicRow: Failed to pause audio:', error);
        }
    };

    // Handle stop action
    const handleStop = async () => {
        try {
            await actions.stopAudio();
        } catch (error) {
            console.error('TopicRow: Failed to stop audio:', error);
        }
    };

    // Handle retry action for errors
    const handleRetry = async () => {
        actions.resetError();
        await handlePlay();
    };

    // Get container style based on playback state
    const getContainerStyle = (): ViewStyle[] => {
        const baseStyle = [styles.container];

        // Add special styling only for currently active topic
        if (isCurrentTopic) {
            if (playbackState === 'playing') {
                baseStyle.push(styles.playingContainer);
            } else if (playbackState === 'paused') {
                baseStyle.push(styles.pausedContainer);
            } else if (playbackState === 'error' || hasError) {
                baseStyle.push(styles.errorContainer);
            } else if (playbackState === 'loading') {
                baseStyle.push(styles.loadingContainer);
            } else if (playbackState === 'stopped') {
                baseStyle.push(styles.stoppedContainer);
            }
        } else {
            // Debug: Make inactive topics highly visible
            baseStyle.push(styles.inactiveContainer);
        }

        if (style) {
            baseStyle.push(style);
        }

        return baseStyle;
    };

    // Get progress indicator style
    const getProgressIndicatorStyle = (): ViewStyle => {
        if (!isCurrentTopic || progress.percentage === 0) {
            return { width: 0 };
        }

        return {
            width: `${Math.min(progress.percentage, 100)}%`,
        };
    };

    // Format current position for display
    const formatCurrentPosition = (): string => {
        if (!isCurrentTopic || progress.currentPosition === 0) {
            return formatDuration(topic.duration);
        }

        const current = formatDuration(Math.floor(progress.currentPosition));
        const total = formatDuration(topic.duration);
        return `${current} / ${total}`;
    };

    return (
        <View
            style={getContainerStyle()}
            testID={testID}
        >
            {/* Progress indicator bar at the top */}
            <View style={styles.progressTrack}>
                <View
                    style={[styles.progressFill, getProgressIndicatorStyle()]}
                    testID={`${testID}-progress-indicator`}
                />
            </View>

            {/* Main content area */}
            <View style={styles.contentContainer}>
                {/* Topic information */}
                <View style={styles.topicInfo}>
                    <Text
                        style={[
                            styles.topicTitle,
                            isCurrentTopic && styles.activeTopicTitle
                        ]}
                        numberOfLines={2}
                        testID={`${testID}-title`}
                    >
                        {topic.title}
                    </Text>

                    <View style={styles.metadataContainer}>
                        <Text
                            style={[
                                styles.duration,
                                isCurrentTopic && styles.activeDuration
                            ]}
                            testID={`${testID}-duration`}
                        >
                            {formatCurrentPosition()}
                        </Text>

                        {/* Show playback state indicator only for current topic */}
                        {isCurrentTopic && (
                            <View style={styles.stateIndicator}>
                                <Text style={styles.stateText}>
                                    {playbackState === 'playing' && '♪ Playing'}
                                    {playbackState === 'paused' && '⏸ Paused'}
                                    {playbackState === 'loading' && '⏳ Loading'}
                                    {(playbackState === 'error' || hasError) && '⚠ Error'}
                                    {playbackState === 'stopped' && '⏹ Stopped'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Inline audio controls */}
                <View style={styles.controlsContainer}>

                    <InlineAudioControls
                        playbackState={playbackState}
                        isActive={isCurrentTopic}
                        hasError={hasError}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onStop={handleStop}
                        onRetry={handleRetry}
                        size="medium"
                        testID={`${testID}-controls`}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    } as ViewStyle,

    playingContainer: {
        backgroundColor: '#F0F8FF',
        borderWidth: 2,
        borderColor: '#007AFF',
        elevation: 4,
        shadowOpacity: 0.3,
        shadowRadius: 4,
    } as ViewStyle,

    pausedContainer: {
        backgroundColor: '#FFF8F0',
        borderWidth: 1,
        borderColor: '#FF9500',
    } as ViewStyle,

    loadingContainer: {
        backgroundColor: '#F8F8F8',
        borderWidth: 1,
        borderColor: '#C7C7CC',
    } as ViewStyle,

    errorContainer: {
        backgroundColor: '#FFF0F0',
        borderWidth: 2,
        borderColor: '#FF6B6B',
    } as ViewStyle,

    stoppedContainer: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    } as ViewStyle,

    inactiveContainer: {
        backgroundColor: '#FAFAFA', // Light gray background for inactive topics
        borderWidth: 1,
        borderColor: '#E5E7EB', // Light gray border
        opacity: 0.9, // Slightly transparent to show they're inactive
    } as ViewStyle,

    progressTrack: {
        height: 3,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        width: '100%',
    } as ViewStyle,

    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 1.5,
    } as ViewStyle,

    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        minHeight: 80, // Ensure minimum touch target area
    } as ViewStyle,

    topicInfo: {
        flex: 1,
        marginRight: 16,
        justifyContent: 'center',
    } as ViewStyle,

    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        lineHeight: 22,
        marginBottom: 8,
    } as ViewStyle,

    activeTopicTitle: {
        color: '#007AFF',
        fontWeight: '700',
    } as ViewStyle,

    metadataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    } as ViewStyle,

    duration: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        marginRight: 12,
    } as ViewStyle,

    activeDuration: {
        color: '#007AFF',
        fontWeight: '600',
    } as ViewStyle,

    stateIndicator: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    } as ViewStyle,

    stateText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
    } as ViewStyle,

    controlsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60, // Ensure adequate space for controls
    } as ViewStyle,
});

export default TopicRow;