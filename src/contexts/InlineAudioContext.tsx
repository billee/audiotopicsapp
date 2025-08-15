import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo, ReactNode } from 'react';
import InlineAudioManager, {
    InlineAudioState as AudioState,
    InlineAudioProgress,
    InlineAudioError
} from '../services/InlineAudioManager';
import { AudioTopic } from '../types';

// State interface for the inline audio context
export interface InlineAudioState {
    currentPlayingTopic: string | null;
    lastPlayedTopic: string | null;
    playbackState: AudioState;
    progress: InlineAudioProgress;
    error: InlineAudioError | null;
}

// Action types for state management
export type InlineAudioAction =
    | { type: 'SET_CURRENT_TOPIC'; payload: string | null }
    | { type: 'SET_LAST_PLAYED_TOPIC'; payload: string | null }
    | { type: 'SET_PLAYBACK_STATE'; payload: AudioState }
    | { type: 'SET_PROGRESS'; payload: InlineAudioProgress }
    | { type: 'SET_ERROR'; payload: InlineAudioError | null }
    | { type: 'RESET_ERROR' }
    | { type: 'RESET_STATE' };

// Context actions interface
export interface InlineAudioActions {
    playTopic: (topic: AudioTopic) => Promise<void>;
    pauseAudio: () => Promise<void>;
    stopAudio: () => Promise<void>;
    resetError: () => void;
    isTopicPlaying: (topicId: string) => boolean;
    isTopicPaused: (topicId: string) => boolean;
    getCurrentTopic: () => AudioTopic | null;
}

// Combined context interface
export interface InlineAudioContextValue {
    state: InlineAudioState;
    actions: InlineAudioActions;
}

// Initial state
const initialState: InlineAudioState = {
    currentPlayingTopic: null,
    lastPlayedTopic: null,
    playbackState: 'idle',
    progress: {
        currentPosition: 0,
        duration: 0,
        percentage: 0
    },
    error: null
};

// Reducer function for state management
function inlineAudioReducer(state: InlineAudioState, action: InlineAudioAction): InlineAudioState {
    switch (action.type) {
        case 'SET_CURRENT_TOPIC':
            return {
                ...state,
                currentPlayingTopic: action.payload
            };

        case 'SET_LAST_PLAYED_TOPIC':
            return {
                ...state,
                lastPlayedTopic: action.payload
            };

        case 'SET_PLAYBACK_STATE':
            return {
                ...state,
                playbackState: action.payload
            };

        case 'SET_PROGRESS':
            return {
                ...state,
                progress: action.payload
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                playbackState: action.payload ? 'error' : state.playbackState
            };

        case 'RESET_ERROR':
            return {
                ...state,
                error: null
            };

        case 'RESET_STATE':
            return {
                ...initialState
            };

        default:
            return state;
    }
}

// Create the context
const InlineAudioContext = createContext<InlineAudioContextValue | null>(null);

// Provider component props
interface InlineAudioProviderProps {
    children: ReactNode;
}

// Provider component
export function InlineAudioProvider({ children }: InlineAudioProviderProps) {
    const [state, dispatch] = useReducer(inlineAudioReducer, initialState);
    const audioManagerRef = useRef<InlineAudioManager | null>(null);
    const currentTopicRef = useRef<string | null>(null);

    // Keep currentTopicRef in sync with state
    useEffect(() => {
        currentTopicRef.current = state.currentPlayingTopic;
    }, [state.currentPlayingTopic]);

    // Initialize audio manager
    useEffect(() => {
        audioManagerRef.current = new InlineAudioManager();

        // Set up event handlers
        audioManagerRef.current.setEventHandlers({
            onStateChange: (newState: AudioState) => {
                dispatch({ type: 'SET_PLAYBACK_STATE', payload: newState });
                // Don't clear currentPlayingTopic - let it persist for UI state
            },

            onProgressUpdate: (progress: InlineAudioProgress) => {
                dispatch({ type: 'SET_PROGRESS', payload: progress });
            },

            onError: (error: InlineAudioError) => {
                dispatch({ type: 'SET_ERROR', payload: error });
            },

            onPlaybackComplete: () => {
                // Keep current topic but set state to stopped
                dispatch({ type: 'SET_PLAYBACK_STATE', payload: 'stopped' });
            }
        });

        // Cleanup on unmount
        return () => {
            if (audioManagerRef.current) {
                audioManagerRef.current.cleanup();
            }
        };
    }, []);

    // Action implementations (memoized for stability)
    const actions: InlineAudioActions = useMemo(() => ({
        playTopic: async (topic: AudioTopic) => {
            if (!audioManagerRef.current) {
                throw new Error('Audio manager not initialized');
            }

            try {
                // Clear any previous errors
                dispatch({ type: 'RESET_ERROR' });



                // Set current topic immediately for UI feedback
                dispatch({ type: 'SET_CURRENT_TOPIC', payload: topic.id });

                // Set state to loading immediately for UI feedback
                dispatch({ type: 'SET_PLAYBACK_STATE', payload: 'loading' });

                // Play the topic
                await audioManagerRef.current.playTopic(topic);
            } catch (error) {
                console.error('InlineAudioContext: Failed to play topic:', error);
                dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        code: 'PLAY_ERROR',
                        message: `Failed to play ${topic.title}`,
                        retryable: true
                    }
                });
                // Reset current topic on error
                dispatch({ type: 'SET_CURRENT_TOPIC', payload: null });
            }
        },

        pauseAudio: async () => {
            if (!audioManagerRef.current) {
                return;
            }

            try {
                await audioManagerRef.current.pauseAudio();
            } catch (error) {
                console.error('InlineAudioContext: Failed to pause audio:', error);
                dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        code: 'PAUSE_ERROR',
                        message: 'Failed to pause audio',
                        retryable: true
                    }
                });
            }
        },

        stopAudio: async () => {
            if (!audioManagerRef.current) {
                return;
            }

            try {
                await audioManagerRef.current.stopAudio();
                // Keep currentPlayingTopic set - don't clear it
            } catch (error) {
                console.error('InlineAudioContext: Failed to stop audio:', error);
                dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        code: 'STOP_ERROR',
                        message: 'Failed to stop audio',
                        retryable: false
                    }
                });
            }
        },

        resetError: () => {
            dispatch({ type: 'RESET_ERROR' });
        },

        isTopicPlaying: (topicId: string) => {
            return audioManagerRef.current?.isTopicPlaying(topicId) ?? false;
        },

        isTopicPaused: (topicId: string) => {
            return audioManagerRef.current?.isTopicPaused(topicId) ?? false;
        },

        getCurrentTopic: () => {
            return audioManagerRef.current?.getCurrentTopic() ?? null;
        }
    }), [state.currentPlayingTopic]); // Re-create when currentPlayingTopic changes

    const contextValue: InlineAudioContextValue = {
        state,
        actions
    };

    return (
        <InlineAudioContext.Provider value={contextValue}>
            {children}
        </InlineAudioContext.Provider>
    );
}

// Custom hook for using the inline audio context
export function useInlineAudio(): InlineAudioContextValue {
    const context = useContext(InlineAudioContext);

    if (!context) {
        throw new Error('useInlineAudio must be used within an InlineAudioProvider');
    }

    return context;
}

// Export the context for testing purposes
export { InlineAudioContext };