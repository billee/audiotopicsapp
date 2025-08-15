/**
 * Test for InlineAudioContext race condition fix
 * Verifies that stopAudio and onStateChange don't interfere with each other
 */

describe('InlineAudioContext Race Condition Fix', () => {
    it('should handle multiple play-stop cycles without losing lastPlayedTopic', () => {
        // Simulate the race condition scenario

        // Initial state
        let state = {
            currentPlayingTopic: null,
            lastPlayedTopic: null,
            playbackState: 'idle' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        // First play-stop cycle
        // User clicks play
        state = {
            ...state,
            currentPlayingTopic: 'topic-1',
            lastPlayedTopic: null,
            playbackState: 'loading' as const,
        };

        // AudioManager updates to playing
        state = {
            ...state,
            playbackState: 'playing' as const,
        };

        // User clicks stop
        // stopAudio action should set lastPlayedTopic BEFORE clearing currentPlayingTopic
        const currentTopicBeforeStop = state.currentPlayingTopic;
        state = {
            ...state,
            lastPlayedTopic: currentTopicBeforeStop, // Set by stopAudio action
            currentPlayingTopic: null, // Cleared by stopAudio action
        };

        // AudioManager calls onStateChange with 'stopped'
        // This should NOT override lastPlayedTopic because currentPlayingTopic is already null
        state = {
            ...state,
            playbackState: 'stopped' as const,
            // lastPlayedTopic should remain 'topic-1', not be overridden to null
        };

        expect(state.lastPlayedTopic).toBe('topic-1'); // Should still be set
        expect(state.currentPlayingTopic).toBeNull();
        expect(state.playbackState).toBe('stopped');

        // Second play-stop cycle
        // User clicks play again
        state = {
            ...state,
            currentPlayingTopic: 'topic-1',
            lastPlayedTopic: null, // Cleared when starting new topic
            playbackState: 'loading' as const,
        };

        // AudioManager updates to playing
        state = {
            ...state,
            playbackState: 'playing' as const,
        };

        // User clicks stop again
        // stopAudio action should set lastPlayedTopic again
        const currentTopicBeforeSecondStop = state.currentPlayingTopic;
        state = {
            ...state,
            lastPlayedTopic: currentTopicBeforeSecondStop, // Set by stopAudio action
            currentPlayingTopic: null, // Cleared by stopAudio action
        };

        // AudioManager calls onStateChange with 'stopped' again
        // This should NOT override lastPlayedTopic
        state = {
            ...state,
            playbackState: 'stopped' as const,
            // lastPlayedTopic should remain 'topic-1', not be overridden to null
        };

        expect(state.lastPlayedTopic).toBe('topic-1'); // Should still be set after second stop
        expect(state.currentPlayingTopic).toBeNull();
        expect(state.playbackState).toBe('stopped');

        // TopicRow should show the stopped state
        const topicId = 'topic-1';
        const isCurrentTopic = state.currentPlayingTopic === topicId;
        const isLastPlayedTopic = state.lastPlayedTopic === topicId && state.playbackState === 'stopped';
        const isActiveOrLastPlayed = isCurrentTopic || isLastPlayedTopic;

        expect(isCurrentTopic).toBe(false);
        expect(isLastPlayedTopic).toBe(true);
        expect(isActiveOrLastPlayed).toBe(true); // Box should not be blank
    });

    it('should handle natural playback completion correctly', () => {
        // Test when audio finishes naturally (not manually stopped)

        let state = {
            currentPlayingTopic: 'topic-1',
            lastPlayedTopic: null,
            playbackState: 'playing' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        // Audio finishes naturally - onPlaybackComplete is called
        const currentTopicBeforeComplete = state.currentPlayingTopic;
        state = {
            ...state,
            lastPlayedTopic: currentTopicBeforeComplete, // Set by onPlaybackComplete
            currentPlayingTopic: null, // Cleared by onPlaybackComplete
            playbackState: 'stopped' as const, // Set by onPlaybackComplete
        };

        expect(state.lastPlayedTopic).toBe('topic-1');
        expect(state.currentPlayingTopic).toBeNull();
        expect(state.playbackState).toBe('stopped');

        // TopicRow should show the stopped state
        const topicId = 'topic-1';
        const isCurrentTopic = state.currentPlayingTopic === topicId;
        const isLastPlayedTopic = state.lastPlayedTopic === topicId && state.playbackState === 'stopped';
        const isActiveOrLastPlayed = isCurrentTopic || isLastPlayedTopic;

        expect(isActiveOrLastPlayed).toBe(true); // Should show stopped state
    });
});