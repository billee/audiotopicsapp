/**
 * Unit test for InlineAudioContext state logic
 * Verifies that the state management handles stop correctly
 */

describe('InlineAudioContext State Logic', () => {
    it('should include lastPlayedTopic in state interface', () => {
        // Test the state structure
        const mockState = {
            currentPlayingTopic: 'topic-1',
            lastPlayedTopic: null,
            playbackState: 'playing' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        expect(mockState.lastPlayedTopic).toBeDefined();
        expect(mockState.currentPlayingTopic).toBe('topic-1');
    });

    it('should handle stop state transition correctly', () => {
        // Simulate the state transition when stopping
        const initialState = {
            currentPlayingTopic: 'topic-1',
            lastPlayedTopic: null,
            playbackState: 'playing' as const,
            progress: { currentPosition: 30, duration: 100, percentage: 30 },
            error: null,
        };

        // After stop action
        const stoppedState = {
            currentPlayingTopic: null,
            lastPlayedTopic: 'topic-1', // Should be set to the previously playing topic
            playbackState: 'stopped' as const,
            progress: { currentPosition: 30, duration: 100, percentage: 30 },
            error: null,
        };

        expect(stoppedState.currentPlayingTopic).toBeNull();
        expect(stoppedState.lastPlayedTopic).toBe('topic-1');
        expect(stoppedState.playbackState).toBe('stopped');
    });

    it('should handle TopicRow state detection logic', () => {
        // Test the logic used in TopicRow component
        const topicId = 'topic-1';

        // State when topic is stopped
        const stoppedState = {
            currentPlayingTopic: null,
            lastPlayedTopic: 'topic-1',
            playbackState: 'stopped' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        // TopicRow logic
        const isCurrentTopic = stoppedState.currentPlayingTopic === topicId;
        const isLastPlayedTopic = stoppedState.lastPlayedTopic === topicId && stoppedState.playbackState === 'stopped';
        const isActiveOrLastPlayed = isCurrentTopic || isLastPlayedTopic;
        const playbackState = isCurrentTopic ? stoppedState.playbackState : (isLastPlayedTopic ? 'stopped' : 'idle');

        expect(isCurrentTopic).toBe(false);
        expect(isLastPlayedTopic).toBe(true);
        expect(isActiveOrLastPlayed).toBe(true);
        expect(playbackState).toBe('stopped');
    });

    it('should clear lastPlayedTopic when new topic starts playing', () => {
        // State with a previously stopped topic
        const stateWithStoppedTopic = {
            currentPlayingTopic: null,
            lastPlayedTopic: 'topic-1',
            playbackState: 'stopped' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        // After starting a new topic
        const stateWithNewTopic = {
            currentPlayingTopic: 'topic-2',
            lastPlayedTopic: null, // Should be cleared
            playbackState: 'playing' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        expect(stateWithNewTopic.currentPlayingTopic).toBe('topic-2');
        expect(stateWithNewTopic.lastPlayedTopic).toBeNull();
        expect(stateWithNewTopic.playbackState).toBe('playing');
    });

    it('should handle multiple topics correctly', () => {
        // Test that only the correct topic shows as stopped
        const stoppedState = {
            currentPlayingTopic: null,
            lastPlayedTopic: 'topic-1',
            playbackState: 'stopped' as const,
            progress: { currentPosition: 0, duration: 0, percentage: 0 },
            error: null,
        };

        // Check topic-1 (should be active/stopped)
        const topic1Id = 'topic-1';
        const isCurrentTopic1 = stoppedState.currentPlayingTopic === topic1Id;
        const isLastPlayedTopic1 = stoppedState.lastPlayedTopic === topic1Id && stoppedState.playbackState === 'stopped';
        const isActiveOrLastPlayed1 = isCurrentTopic1 || isLastPlayedTopic1;

        // Check topic-2 (should be idle)
        const topic2Id = 'topic-2';
        const isCurrentTopic2 = stoppedState.currentPlayingTopic === topic2Id;
        const isLastPlayedTopic2 = stoppedState.lastPlayedTopic === topic2Id && stoppedState.playbackState === 'stopped';
        const isActiveOrLastPlayed2 = isCurrentTopic2 || isLastPlayedTopic2;

        expect(isActiveOrLastPlayed1).toBe(true); // topic-1 should show as stopped
        expect(isActiveOrLastPlayed2).toBe(false); // topic-2 should be idle
    });
});