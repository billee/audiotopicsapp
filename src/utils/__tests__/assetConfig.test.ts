import {
    HIGH_QUALITY_BACKGROUND_CONFIG,
    LOCAL_ASSET_CONFIG,
    IMAGE_QUALITY_SETTINGS,
    OVERLAY_SETTINGS,
    CACHE_SETTINGS,
    ERROR_HANDLING_CONFIG,
    PERFORMANCE_SETTINGS,
    getContextConfig,
    validateAssetConfiguration,
    getAssetStatistics,
} from '../assetConfig';
import { BackgroundContext } from '../../types/backgroundImage';

describe('assetConfig', () => {
    describe('Configuration Objects', () => {
        describe('HIGH_QUALITY_BACKGROUND_CONFIG', () => {
            it('has all required category screen properties', () => {
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.categoryScreen.default).toBeDefined();
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.categoryScreen.fallback).toBeDefined();
            });

            it('has all required topic list properties', () => {
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.topicList.default).toBeDefined();
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.topicList.technology).toBeDefined();
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.topicList.science).toBeDefined();
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.topicList.history).toBeDefined();
            });

            it('has all required audio player properties', () => {
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.audioPlayer.default).toBeDefined();
                expect(Array.isArray(HIGH_QUALITY_BACKGROUND_CONFIG.audioPlayer.ambient)).toBe(true);
                expect(HIGH_QUALITY_BACKGROUND_CONFIG.audioPlayer.ambient.length).toBeGreaterThan(0);
            });
        });

        describe('LOCAL_ASSET_CONFIG', () => {
            it('has corresponding local assets for all remote assets', () => {
                expect(LOCAL_ASSET_CONFIG.categoryScreen.default).toBeDefined();
                expect(LOCAL_ASSET_CONFIG.categoryScreen.fallback).toBeDefined();
                expect(LOCAL_ASSET_CONFIG.topicList.default).toBeDefined();
                expect(LOCAL_ASSET_CONFIG.audioPlayer.default).toBeDefined();
                expect(Array.isArray(LOCAL_ASSET_CONFIG.audioPlayer.ambient)).toBe(true);
            });
        });

        describe('IMAGE_QUALITY_SETTINGS', () => {
            it('has valid minimum and maximum dimensions', () => {
                expect(IMAGE_QUALITY_SETTINGS.minDimensions.width).toBeGreaterThan(0);
                expect(IMAGE_QUALITY_SETTINGS.minDimensions.height).toBeGreaterThan(0);
                expect(IMAGE_QUALITY_SETTINGS.maxDimensions.width).toBeGreaterThan(IMAGE_QUALITY_SETTINGS.minDimensions.width);
                expect(IMAGE_QUALITY_SETTINGS.maxDimensions.height).toBeGreaterThan(IMAGE_QUALITY_SETTINGS.minDimensions.height);
            });

            it('has valid breakpoints in ascending order', () => {
                const { breakpoints } = IMAGE_QUALITY_SETTINGS;
                expect(breakpoints.small.width).toBeLessThan(breakpoints.medium.width);
                expect(breakpoints.medium.width).toBeLessThan(breakpoints.large.width);
                expect(breakpoints.large.width).toBeLessThan(breakpoints.xlarge.width);
            });

            it('has valid compression settings', () => {
                expect(IMAGE_QUALITY_SETTINGS.compression.quality).toBeGreaterThan(0);
                expect(IMAGE_QUALITY_SETTINGS.compression.quality).toBeLessThanOrEqual(100);
                expect(IMAGE_QUALITY_SETTINGS.compression.format).toBeDefined();
                expect(IMAGE_QUALITY_SETTINGS.compression.fallbackFormat).toBeDefined();
            });
        });

        describe('OVERLAY_SETTINGS', () => {
            it('has settings for all context types', () => {
                expect(OVERLAY_SETTINGS.categoryScreen).toBeDefined();
                expect(OVERLAY_SETTINGS.topicList).toBeDefined();
                expect(OVERLAY_SETTINGS.audioPlayer).toBeDefined();
            });

            it('has valid overlay opacity values', () => {
                Object.values(OVERLAY_SETTINGS).forEach(setting => {
                    expect(setting.overlayOpacity).toBeGreaterThanOrEqual(0);
                    expect(setting.overlayOpacity).toBeLessThanOrEqual(1);
                    expect(setting.minContrastRatio).toBeGreaterThan(0);
                });
            });
        });

        describe('CACHE_SETTINGS', () => {
            it('has valid cache configuration', () => {
                expect(CACHE_SETTINGS.maxCacheSize).toBeGreaterThan(0);
                expect(CACHE_SETTINGS.cacheExpiration).toBeGreaterThan(0);
                expect(Array.isArray(CACHE_SETTINGS.preloadImages)).toBe(true);
                expect(CACHE_SETTINGS.preloadImages.length).toBeGreaterThan(0);
                expect(Array.isArray(CACHE_SETTINGS.preloadPriority)).toBe(true);
            });
        });

        describe('ERROR_HANDLING_CONFIG', () => {
            it('has valid error handling settings', () => {
                expect(ERROR_HANDLING_CONFIG.maxRetries).toBeGreaterThan(0);
                expect(ERROR_HANDLING_CONFIG.retryDelay).toBeGreaterThan(0);
                expect(ERROR_HANDLING_CONFIG.fallbackStrategy).toBeDefined();
                expect(ERROR_HANDLING_CONFIG.fallbackColors).toBeDefined();
            });

            it('has fallback colors for all contexts', () => {
                expect(ERROR_HANDLING_CONFIG.fallbackColors.categoryScreen).toBeDefined();
                expect(ERROR_HANDLING_CONFIG.fallbackColors.topicList).toBeDefined();
                expect(ERROR_HANDLING_CONFIG.fallbackColors.audioPlayer).toBeDefined();
            });
        });

        describe('PERFORMANCE_SETTINGS', () => {
            it('has valid performance configuration', () => {
                expect(typeof PERFORMANCE_SETTINGS.enableLazyLoading).toBe('boolean');
                expect(typeof PERFORMANCE_SETTINGS.enablePreloading).toBe('boolean');
                expect(PERFORMANCE_SETTINGS.maxConcurrentLoads).toBeGreaterThan(0);
                expect(typeof PERFORMANCE_SETTINGS.enableMemoryCleanup).toBe('boolean');
                expect(PERFORMANCE_SETTINGS.memoryCleanupInterval).toBeGreaterThan(0);
            });
        });
    });

    describe('getContextConfig', () => {
        it('returns configuration for category screen context', () => {
            const context: BackgroundContext = { type: 'category-screen' };
            const config = getContextConfig(context);

            expect(config.overlay).toBeDefined();
            expect(config.quality).toBeDefined();
            expect(config.cache).toBeDefined();
            expect(config.errorHandling).toBeDefined();
            expect(config.performance).toBeDefined();
        });

        it('returns configuration for topic list context', () => {
            const context: BackgroundContext = { type: 'topic-list', categoryId: 'technology' };
            const config = getContextConfig(context);

            expect(config.overlay).toBeDefined();
            expect(config.overlay.overlayOpacity).toBe(OVERLAY_SETTINGS.topicList.overlayOpacity);
        });

        it('returns configuration for audio player context', () => {
            const context: BackgroundContext = { type: 'audio-player' };
            const config = getContextConfig(context);

            expect(config.overlay).toBeDefined();
            expect(config.overlay.overlayOpacity).toBe(OVERLAY_SETTINGS.audioPlayer.overlayOpacity);
        });

        it('falls back to category screen config for unknown context', () => {
            const context = { type: 'unknown-context' } as any;
            const config = getContextConfig(context);

            expect(config.overlay.overlayOpacity).toBe(OVERLAY_SETTINGS.categoryScreen.overlayOpacity);
        });
    });

    describe('validateAssetConfiguration', () => {
        it('returns valid configuration for complete assets', () => {
            const validation = validateAssetConfiguration();

            expect(validation.isValid).toBe(true);
            expect(validation.missingAssets).toHaveLength(0);
            expect(validation.errors).toHaveLength(0);
        });

        // Note: In a real scenario, you might want to test with incomplete configurations
        // by mocking the backgroundAssets import, but for this test we assume complete assets
    });

    describe('getAssetStatistics', () => {
        it('returns accurate asset statistics', () => {
            const stats = getAssetStatistics();

            expect(stats.totalAssets).toBeGreaterThan(0);
            expect(stats.categoryScreenAssets).toBeGreaterThan(0);
            expect(stats.topicListAssets).toBeGreaterThan(0);
            expect(stats.audioPlayerAssets).toBeGreaterThan(0);
            expect(stats.ambientAssets).toBeGreaterThan(0);

            // Total should equal sum of individual counts
            const expectedTotal = stats.categoryScreenAssets + stats.topicListAssets + stats.audioPlayerAssets + stats.ambientAssets;
            expect(stats.totalAssets).toBe(expectedTotal);
        });

        it('has reasonable asset counts', () => {
            const stats = getAssetStatistics();

            // Should have at least 2 category screen assets (default + fallback)
            expect(stats.categoryScreenAssets).toBeGreaterThanOrEqual(2);

            // Should have multiple topic list assets (categories + default)
            expect(stats.topicListAssets).toBeGreaterThanOrEqual(6);

            // Should have at least 1 audio player asset
            expect(stats.audioPlayerAssets).toBeGreaterThanOrEqual(1);

            // Should have multiple ambient assets
            expect(stats.ambientAssets).toBeGreaterThanOrEqual(3);
        });
    });
});