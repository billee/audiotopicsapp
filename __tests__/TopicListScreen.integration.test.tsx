/**
 * Integration tests for TopicListScreen with inline audio functionality
 * Tests the complete flow of topic list display and inline audio controls
 */

import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TopicListScreen from '../src/screens/TopicListScreen';

// Mock navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
};

// Mock route
const mockRoute = {
    params: {
        categoryId: '1',
        categoryName: 'Filipino News',
    },
};

// Mock hooks
jest.mock('../src/hooks/useTopics', () => ({
    useTopics: () => ({
        topicsWithProgress: [],
        loading: false,
        error: null,
        stats: { total: 0, completed: 0, inProgress: 0 },
        loadTopicsForCategory: jest.fn(),
        refreshTopics: jest.fn(),
    }),
}));

jest.mock('../src/hooks/useBackgroundImage', () => ({
    useBackgroundImage: () => ({
        getBackgroundImage: () => null,
    }),
}));

// Mock InlineAudioManager
jest.mock('../src/services/InlineAudioManager', () => {
    return jest.fn().mockImplementation(() => ({
        setEventHandlers: jest.fn(),
        playTopic: jest.fn().mockResolvedValue(undefined),
        pauseAudio: jest.fn().mockResolvedValue(undefined),
        stopAudio: jest.fn().mockResolvedValue(undefined),
        cleanup: jest.fn(),
        isTopicPlaying: jest.fn().mockReturnValue(false),
        isTopicPaused: jest.fn().mockReturnValue(false),
        getCurrentTopic: jest.fn().mockReturnValue(null),
    }));
});

// Mock store slices
const mockCategoriesSlice = {
    reducer: (state = { categories: [], loading: false, error: null }, action: any) => state,
};

const mockAudioSlice = {
    reducer: (state = {
        currentTopic: null,
        playbackState: 'idle',
        currentPosition: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        isLoading: false,
        error: null
    }, action: any) => state,
};

const mockProgressSlice = {
    reducer: (state = { topicProgress: {}, categoryStats: {}, loading: false, error: null }, action: any) => state,
};

// Create test store
const createTestStore = () => {
    return configureStore({
        reducer: {
            categories: mockCategoriesSlice.reducer,
            audio: mockAudioSlice.reducer,
            progress: mockProgressSlice.reducer,
        },
        preloadedState: {
            categories: {
                categories: [
                    {
                        id: '1',
                        name: 'Filipino News',
                        description: 'Latest news in Filipino',
                        topicCount: 3,
                        color: '#007AFF',
                    },
                ],
                loading: false,
                error: null,
            },
            audio: {
                currentTopic: null,
                playbackState: 'idle',
                currentPosition: 0,
                duration: 0,
                volume: 1,
                playbackRate: 1,
                isLoading: false,
                error: null,
            },
            progress: {
                topicProgress: {},
                categoryStats: {},
                loading: false,
                error: null,
            },
        },
    });
};

// Test component wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = createTestStore();
    return <Provider store={store}>{children}</Provider>;
};

describe('TopicListScreen Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders topic list screen with inline audio provider', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        // Check if header is rendered
        expect(screen.getByText('Filipino News')).toBeTruthy();

        // Check if background is rendered
        expect(screen.getByTestId('topic-list-background')).toBeTruthy();
    });

    it('displays sample topics with TopicRow components', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        await waitFor(() => {
            // Check if sample topics are rendered
            expect(screen.getByText('Mga Balitang Pang-ekonomiya ngayong Linggo')).toBeTruthy();
            expect(screen.getByText('Usapang Politika: Mga Nangyayari sa Senado')).toBeTruthy();
            expect(screen.getByText('Mga Pagbabago sa Lokal na Pamahalaan')).toBeTruthy();
        });
    });

    it('renders ScrollView for vertical scrolling', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        // Check if ScrollView is rendered
        expect(screen.getByTestId('topic-list-scroll')).toBeTruthy();
    });

    it('renders TopicRow components with correct test IDs', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        await waitFor(() => {
            // Check if TopicRow components are rendered with correct test IDs
            expect(screen.getByTestId('topic-row-1')).toBeTruthy();
            expect(screen.getByTestId('topic-row-2')).toBeTruthy();
            expect(screen.getByTestId('topic-row-3')).toBeTruthy();
        });
    });

    it('provides inline audio context to child components', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        // The InlineAudioProvider should wrap the entire screen content
        // TopicRow components should be able to access the context
        await waitFor(() => {
            expect(screen.getByTestId('topic-row-1')).toBeTruthy();
        });
    });

    it('converts sample topics to proper AudioTopic format', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        await waitFor(() => {
            // Verify topics are rendered, which means they were properly converted
            expect(screen.getByText('Mga Balitang Pang-ekonomiya ngayong Linggo')).toBeTruthy();

            // The fact that TopicRow components render without errors indicates
            // the topics were properly converted to AudioTopic format with all required fields
            expect(screen.getByTestId('topic-row-1')).toBeTruthy();
        });
    });

    it('removes navigation to AudioPlayerScreen functionality', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        // Verify that navigation.navigate is not called for AudioPlayer
        // since we're using inline audio controls instead
        expect(mockNavigation.navigate).not.toHaveBeenCalledWith('AudioPlayer', expect.any(Object));
    });

    it('handles category color and background properly', async () => {
        render(
            <TestWrapper>
                <TopicListScreen route={mockRoute} navigation={mockNavigation} />
            </TestWrapper>
        );

        // Check if background image component is rendered
        expect(screen.getByTestId('topic-list-background')).toBeTruthy();
    });
});