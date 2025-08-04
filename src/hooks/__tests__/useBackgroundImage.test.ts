import { renderHook, act } from '@testing-library/react-hooks';
import { useBackgroundImage } from '../useBackgroundImage';
import { BackgroundConfig } from '../../types/backgroundImage';

// Mock FastImage
jest.mock('react-native-fast-image', () => ({
    preload: jest.fn(() => Promise.resolve()),
    priority: {
        low: 'low',
        normal: 'normal',
        high: 'high',
    },
    cacheControl: {
        immutable: 'immutable',
        web: 'web',
        cacheOnly: 'cacheOnly',
    },
}));

describe('useBackgroundImage', () => {
    const mockConfig: BackgroundConfig = {
        categoryScreen: {
            default: 'https://example.com/category.jpg',
            fallback: '#1a1a1a',
        },
        topicList: {
            technology: 'https://example.com/tech.jpg',
            science: 'https://example.com/science.jpg',
            default: 'https://example.com/default-topic.jpg',
        },
        audioPlayer: {
            default: 'https://example.com/audio.jpg',
            ambient: [
                'https://example.com/ambient1.jpg',
                'https://example.com/ambient2.jpg',
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns correct background image for category screen', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const image = result.current.getBackgroundImage({ type: 'category-screen' });
        expect(image).toBe('https://example.com/category.jpg');
    });

    it('returns correct background image for topic list with specific category', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const image = result.current.getBackgroundImage({
            type: 'topic-list',
            categoryId: 'technology',
        });
        expect(image).toBe('https://example.com/tech.jpg');
    });

    it('returns default topic image for unknown category', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const image = result.current.getBackgroundImage({
            type: 'topic-list',
            categoryId: 'unknown',
        });
        expect(image).toBe('https://example.com/default-topic.jpg');
    });

    it('returns ambient background for audio player', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const image = result.current.getBackgroundImage({
            type: 'audio-player',
        });

        // Should return one of the ambient images
        expect(mockConfig.audioPlayer.ambient).toContain(image);
    });

    it('returns topic-specific background for audio player with topicId', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const image1 = result.current.getBackgroundImage({
            type: 'audio-player',
            topicId: 'topic1',
        });

        const image2 = result.current.getBackgroundImage({
            type: 'audio-player',
            topicId: 'topic1',
        });

        // Should return the same image for the same topicId
        expect(image1).toBe(image2);
        expect(mockConfig.audioPlayer.ambient).toContain(image1);
    });

    it('rotates through ambient backgrounds when no topicId provided', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const images = [];
        for (let i = 0; i < mockConfig.audioPlayer.ambient.length + 1; i++) {
            images.push(result.current.getBackgroundImage({
                type: 'audio-player',
            }));
        }

        // Should have used different images (rotation)
        const uniqueImages = new Set(images);
        expect(uniqueImages.size).toBeGreaterThan(1);
    });

    it('returns default audio background when no ambient images', () => {
        const configWithoutAmbient = {
            ...mockConfig,
            audioPlayer: {
                default: 'https://example.com/audio.jpg',
                ambient: [],
            },
        };

        const { result } = renderHook(() => useBackgroundImage(configWithoutAmbient));

        const image = result.current.getBackgroundImage({
            type: 'audio-player',
        });
        expect(image).toBe('https://example.com/audio.jpg');
    });

    it('preloads images correctly', async () => {
        const FastImage = require('react-native-fast-image');
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        await act(async () => {
            await result.current.preloadImages();
        });

        expect(FastImage.preload).toHaveBeenCalled();
    });

    it('tracks image loading state', async () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        // Initially, image should not be loaded
        expect(result.current.isImageLoaded('https://example.com/test.jpg')).toBe(false);

        // After preloading, images should be marked as loaded
        await act(async () => {
            await result.current.preloadImages();
        });

        // Check if category image is loaded
        expect(result.current.isImageLoaded('https://example.com/category.jpg')).toBe(true);
    });

    it('uses default config when no config provided', () => {
        const { result } = renderHook(() => useBackgroundImage());

        const image = result.current.getBackgroundImage({ type: 'category-screen' });
        expect(typeof image).toBe('string');
        expect(image.length).toBeGreaterThan(0);
    });

    it('returns image metadata when available', async () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        await act(async () => {
            await result.current.preloadImages();
        });

        const metadata = result.current.getImageMetadata('https://example.com/category.jpg');
        expect(metadata).toBeTruthy();
        expect(metadata?.uri).toBe('https://example.com/category.jpg');
    });

    it('returns null metadata for unloaded images', () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));

        const metadata = result.current.getImageMetadata('https://example.com/nonexistent.jpg');
        expect(metadata).toBeNull();
    });

    it('preloads specific image on demand', async () => {
        const { result } = renderHook(() => useBackgroundImage(mockConfig));
        const testUri = 'https://example.com/specific-image.jpg';

        await act(async () => {
            const success = await result.current.preloadSpecificImage(testUri);
            expect(success).toBe(true);
        });

        expect(result.current.isImageLoaded(testUri)).toBe(true);
    });

    it('returns false when preloading specific image fails', async () => {
        const FastImage = require('react-native-fast-image');
        FastImage.preload.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useBackgroundImage(mockConfig));
        const testUri = 'https://example.com/failing-image.jpg';

        await act(async () => {
            const success = await result.current.preloadSpecificImage(testUri);
            expect(success).toBe(false);
        });

        expect(result.current.isImageLoaded(testUri)).toBe(false);
    });
});