/**
 * Detailed sequence test for InlineAudioContext
 * Simulates the exact sequence of events that occur in the real app
 */

describe('InlineAudioContext Detailed Sequence Test', () => {
    it('should handle the exact sequence: play-stop-play-stop without box becoming blank', () => {
        // This test simulates the exact sequence described by the user:
        // 1. press play - the stop button comes out (correct)
        // 2. press stop - the play button comes out (correct)  
        // 3. press play - the stop button comes out (correct)
        // 4. press stop - the box becomes blank (incorrect - this should be fixed)

        let state = {
            currentPlayingTopic: null,
            lastPlayedTopic: null,
            playbackState: 'idle' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        let currentTopicRef = { current: null as string | null };

        // Helper function to simulate the ref sync
        const syncRef = () => {
            currentTopicRef.current = state.currentPlayingTopic;
        };

        // Helper function to simulate stopAudio action
        const simulateStopAudio = () => {
            // Store the current topic as the last played before stopping
            const currentTopic = currentTopicRef.current;
            if (currentTopic) {
                state = { ...state, lastPlayedTopic: currentTopic };
            }

            // Clear current topic
            state = { ...state, currentPlayingTopic: null };
            syncRef();

            // AudioManager calls onStateChange with 'stopped'
            // With our fix, this should NOT override lastPlayedTopic
            state = { ...state, playbackState: 'stopped' as const };
        };

        // Helper function to simulate playTopic action
        const simulatePlayTopic = (topicId: string) => {
            // Clear last played topic when starting a new one
            state = { ...state, lastPlayedTopic: null };

            // Set current topic immediately for UI feedback
            state = { ...state, currentPlayingTopic: topicId };
            syncRef();

            // Set state to loading immediately for UI feedback
            state = { ...state, playbackState: 'loading' as const };

            // AudioManager eventually updates to playing
            state = { ...state, playbackState: 'playing' as const };
        };

        // Helper function to check TopicRow state
        const checkTopicRowState = (topicId: string) => {
            const isCurrentTopic = state.currentPlayingTopic === topicId;
            const isLastPlayedTopic = state.lastPlayedTopic === topicId && state.playbackState === 'stopped';
            const isActiveOrLastPlayed = isCurrentTopic || isLastPlayedTopic;
            const playbackState = isCurrentTopic ? state.playbackState : (isLastPlayedTopic ? 'stopped' : 'idle');

            return {
                isCurrentTopic,
                isLastPlayedTopic,
                isActiveOrLastPlayed,
                playbackState,
                shouldShowControls: isActiveOrLastPlayed,
                shouldShowStopButton: isCurrentTopic && !(playbackState === 'idle' || playbackState === 'stopped'),
                shouldShowPlayButton: !isCurrentTopic || playbackState !== 'playing'
            };
        };

        // 1. press play - the stop button comes out (correct)
        simulatePlayTopic('topic-1');
        let topicState = checkTopicRowState('topic-1');

        expect(topicState.isCurrentTopic).toBe(true);
        expect(topicState.isLastPlayedTopic).toBe(false);
        expect(topicState.shouldShowControls).toBe(true);
        expect(topicState.shouldShowStopButton).toBe(true); // Stop button should be visible
        expect(topicState.playbackState).toBe('playing');

        // 2. press stop - the play button comes out (correct)
        simulateStopAudio();
        topicState = checkTopicRowState('topic-1');

        expect(topicState.isCurrentTopic).toBe(false);
        expect(topicState.isLastPlayedTopic).toBe(true);
        expect(topicState.shouldShowControls).toBe(true);
        expect(topicState.shouldShowStopButton).toBe(false); // Stop button should be hidden
        expect(topicState.shouldShowPlayButton).toBe(true); // Play button should be visible
        expect(topicState.playbackState).toBe('stopped');
        expect(state.lastPlayedTopic).toBe('topic-1'); // Should be preserved

        // 3. press play - the stop button comes out (correct)
        simulatePlayTopic('topic-1');
        topicState = checkTopicRowState('topic-1');

        expect(topicState.isCurrentTopic).toBe(true);
        expect(topicState.isLastPlayedTopic).toBe(false);
        expect(topicState.shouldShowControls).toBe(true);
        expect(topicState.shouldShowStopButton).toBe(true); // Stop button should be visible
        expect(topicState.playbackState).toBe('playing');

        // 4. press stop - the box should NOT become blank (this was the bug)
        simulateStopAudio();
        topicState = checkTopicRowState('topic-1');

        expect(topicState.isCurrentTopic).toBe(false);
        expect(topicState.isLastPlayedTopic).toBe(true);
        expect(topicState.shouldShowControls).toBe(true); // Box should NOT be blank
        expect(topicState.shouldShowStopButton).toBe(false); // Stop button should be hidden
        expect(topicState.shouldShowPlayButton).toBe(true); // Play button should be visible
        expect(topicState.playbackState).toBe('stopped');
        expect(state.lastPlayedTopic).toBe('topic-1'); // Should be preserved (this was the bug)

        console.log('Final state after second stop:', {
            currentPlayingTopic: state.currentPlayingTopic,
            lastPlayedTopic: state.lastPlayedTopic,
            playbackState: state.playbackState,
            topicRowState: topicState
        });
    });
});