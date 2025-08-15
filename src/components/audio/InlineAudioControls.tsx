/**
 * Inline audio controls component for topic rows
 * Provides play/pause/stop controls with visual state indicators
 */

import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    ActivityIndicator,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Note: Haptics support can be added later when expo-haptics is available

export interface InlineAudioControlsProps {
    /** Current playback state */
    playbackState: 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';
    /** Whether this topic is currently active */
    isActive: boolean;
    /** Whether there's an error */
    hasError: boolean;
    /** Play button press handler */
    onPlay: () => void;
    /** Pause button press handler */
    onPause: () => void;
    /** Stop button press handler */
    onStop: () => void;
    /** Retry button press handler for error states */
    onRetry?: () => void;
    /** Size variant for different contexts */
    size?: 'small' | 'medium' | 'large';
    /** Custom style override */
    style?: ViewStyle;
    /** Disable haptic feedback */
    disableHaptics?: boolean;
}

const InlineAudioControls: React.FC<InlineAudioControlsProps> = ({
    playbackState,
    isActive,
    hasError,
    onPlay,
    onPause,
    onStop,
    onRetry,
    size = 'medium',
    style,
    disableHaptics = false,
}) => {
    // Size configurations for touch-friendly interactions
    const sizeConfig = {
        small: {
            buttonSize: 36,
            iconSize: 20,
            spacing: 4,
        },
        medium: {
            buttonSize: 44, // Minimum touch target size
            iconSize: 24,
            spacing: 8,
        },
        large: {
            buttonSize: 56,
            iconSize: 32,
            spacing: 12,
        },
    };

    const config = sizeConfig[size];
    const isLoading = playbackState === 'loading';
    const isPlaying = playbackState === 'playing';
    const isPaused = playbackState === 'paused';
    const isError = playbackState === 'error' || hasError;



    // Haptic feedback helper - placeholder for future implementation
    const triggerHaptic = async () => {
        // TODO: Implement haptic feedback when expo-haptics is available
        if (disableHaptics || Platform.OS === 'web') return;
    };

    // Handle play/pause button press
    const handlePlayPause = async () => {
        await triggerHaptic();

        if (isPlaying) {
            onPause();
        } else {
            onPlay();
        }
    };

    // Handle stop button press
    const handleStop = async () => {
        await triggerHaptic();
        onStop();
    };

    // Handle retry button press
    const handleRetry = async () => {
        await triggerHaptic();
        if (onRetry) {
            onRetry();
        } else {
            onPlay(); // Fallback to play if no retry handler
        }
    };

    // Get button style based on state
    const getButtonStyle = (isMainButton: boolean = false) => {
        const baseStyle = [
            styles.controlButton,
            {
                width: config.buttonSize,
                height: config.buttonSize,
                borderRadius: config.buttonSize / 2,
            },
        ];

        if (isMainButton) {
            if (isError) {
                return [...baseStyle, styles.errorButton];
            } else if (isActive && isPlaying) {
                return [...baseStyle, styles.activeButton];
            } else {
                // Always use primaryButton for main button to ensure visibility
                return [...baseStyle, styles.primaryButton];
            }
        }

        return [...baseStyle, styles.secondaryButton];
    };

    // Get icon color based on state
    const getIconColor = (isMainButton: boolean = false) => {
        if (isError) {
            return '#FFFFFF';
        } else if (isMainButton) {
            return '#FFFFFF';
        } else if (isActive) {
            return '#007AFF';
        } else {
            return '#666666';
        }
    };

    // Render loading indicator
    const renderLoadingIndicator = () => (
        <ActivityIndicator
            size={config.iconSize}
            color="#FFFFFF"
            testID="loading-indicator"
        />
    );

    // Render main play/pause button
    const renderMainButton = () => {
        if (isLoading) {
            return (
                <TouchableOpacity
                    style={getButtonStyle(true)}
                    disabled={true}
                    testID="main-button-loading"
                    accessibilityLabel="Loading audio"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: true }}
                >
                    {renderLoadingIndicator()}
                </TouchableOpacity>
            );
        }

        if (isError) {
            return (
                <TouchableOpacity
                    style={getButtonStyle(true)}
                    onPress={handleRetry}
                    testID="retry-button"
                    accessibilityLabel="Retry playing audio"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to retry playing the audio"
                >
                    <Icon
                        name="refresh"
                        size={config.iconSize}
                        color={getIconColor(true)}
                    />
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={getButtonStyle(true)}
                onPress={handlePlayPause}
                testID={isPlaying ? "pause-button" : "play-button"}
                accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}
                accessibilityRole="button"
                accessibilityHint={
                    isPlaying
                        ? "Double tap to pause the audio"
                        : "Double tap to play the audio"
                }
            >
                <Icon
                    name={isPlaying ? 'pause' : 'play-arrow'}
                    size={config.iconSize}
                    color={getIconColor(true)}
                />
            </TouchableOpacity>
        );
    };

    // Render stop button (only show when playing or paused)
    const renderStopButton = () => {
        if (!isActive || (playbackState === 'idle' || playbackState === 'stopped')) {
            return null;
        }

        return (
            <TouchableOpacity
                style={getButtonStyle(false)}
                onPress={handleStop}
                testID="stop-button"
                accessibilityLabel="Stop audio"
                accessibilityRole="button"
                accessibilityHint="Double tap to stop the audio"
            >
                <Icon
                    name="stop"
                    size={config.iconSize}
                    color={getIconColor(false)}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View
            style={[styles.container, { gap: config.spacing }, style]}
            testID="inline-audio-controls"
        >
            {renderMainButton()}
            {renderStopButton()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,

    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    } as ViewStyle,

    primaryButton: {
        backgroundColor: '#007AFF',
    } as ViewStyle,

    activeButton: {
        backgroundColor: '#007AFF',
        elevation: 4,
        shadowOpacity: 0.3,
        shadowRadius: 4,
    } as ViewStyle,

    secondaryButton: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.3)',
    } as ViewStyle,

    errorButton: {
        backgroundColor: '#FF6B6B',
    } as ViewStyle,
});

export default InlineAudioControls;