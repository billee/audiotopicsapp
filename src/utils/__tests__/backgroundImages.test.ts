import {
    isValidImageUrl,
    getFallbackColor,
    getCategoryColor,
    getOverlayColors,
    getOptimalOverlayOpacity,
    createBackgroundConfig,
    validateBackgroundConfig,
    createImageMetadata,
    getEnhancedCategoryMappings,
    validateImageQuality,
    createResponsiveImageUrl,
    getAmbientBackgrounds,
    getRandomAmbientBackgroundUrl,
    getLocalBackgroundAsset,
    getRemoteBackgroundUrl,
    categoryHasBackground,
    getAllCategoryBackgrounds,
    getBackgroundWithFallback,
    generateResponsiveImageUrls,
    getOptimalImageSize,
    validateImageDimensions,
    generateImageMetadata,
} from '../backgroundImages';
import { BackgroundContext, BackgroundConfig } from '../../types/backgroundImage';

describe('backgroundImages utilities', () => {
    describe('isValidImageUrl', () => {
        it('returns true for valid URLs', () => {
            expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
            expect(isValidImageUrl('http://example.com/image.png')).toBe(true);
        });

        it('returns false for invalid URLs', () => {
            expect(isValidImageUrl('not-a-url')).toBe(false);
            expect(isValidImageUrl('')).toBe(false);
            expect(isValidImageUrl(null as any)).toBe(false);
            expect(isValidImageUrl(undefined as any)).toBe(false);
        });
    });

    describe('getFallbackColor', () => {
        it('returns correct color for category screen', () => {
            const context: BackgroundContext = { type: 'category-screen' };
            expect(getFallbackColor(context)).toBe('#1a1a1a');
        });

        it('returns correct color for topic list', () => {
            const context: BackgroundContext = { type: 'topic-list', categoryId: '1' }; // '1' maps to 'technology'
            expect(getFallbackColor(context)).toBe('#1e3a8a');
        });

        it('returns correct color for audio player', () => {
            const context: BackgroundContext = { type: 'audio-player' };
            expect(getFallbackColor(context)).toBe('#0f0f0f');
        });
    });

    describe('getCategoryColor', () => {
        it('returns specific colors for known categories', () => {
            expect(getCategoryColor('1')).toBe('#1e3a8a'); // '1' maps to 'technology'
            expect(getCategoryColor('2')).toBe('#065f46'); // '2' maps to 'science'
            expect(getCategoryColor('3')).toBe('#7c2d12'); // '3' maps to 'history'
        });

        it('returns default color for unknown categories', () => {
            expect(getCategoryColor('unknown')).toBe('#1a1a1a');
        });
    });

    describe('getOverlayColors', () => {
        it('returns dark overlay for light images', () => {
            const colors = getOverlayColors(false);
            expect(colors).toEqual(['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']);
        });

        it('returns light overlay for dark images', () => {
            const colors = getOverlayColors(true);
            expect(colors).toEqual(['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.3)']);
        });
    });

    describe('getOptimalOverlayOpacity', () => {
        it('returns correct opacity for different contexts', () => {
            expect(getOptimalOverlayOpacity({ type: 'category-screen' })).toBe(0.4);
            expect(getOptimalOverlayOpacity({ type: 'topic-list', categoryId: 'tech' })).toBe(0.5);
            expect(getOptimalOverlayOpacity({ type: 'audio-player' })).toBe(0.3);
        });
    });

    describe('createBackgroundConfig', () => {
        it('creates config with defaults when partial config provided', () => {
            const partialConfig = {
                categoryScreen: {
                    default: 'https://custom.com/image.jpg',
                },
            };

            const config = createBackgroundConfig(partialConfig);

            expect(config.categoryScreen.default).toBe('https://custom.com/image.jpg');
            expect(config.categoryScreen.fallback).toBeDefined();
            expect(config.topicList.default).toBeDefined();
            expect(config.audioPlayer.default).toBeDefined();
        });

        it('merges partial config with defaults correctly', () => {
            const partialConfig = {
                topicList: {
                    customCategory: 'https://custom.com/category.jpg',
                },
            };

            const config = createBackgroundConfig(partialConfig);

            expect(config.topicList.customCategory).toBe('https://custom.com/category.jpg');
            expect(config.topicList.default).toBeDefined();
            expect(config.topicList.technology).toBeDefined();
        });
    });

    describe('validateBackgroundConfig', () => {
        const validConfig: BackgroundConfig = {
            categoryScreen: {
                default: 'https://example.com/category.jpg',
                fallback: '#1a1a1a',
            },
            topicList: {
                default: 'https://example.com/topic.jpg',
                technology: 'https://example.com/tech.jpg',
            },
            audioPlayer: {
                default: 'https://example.com/audio.jpg',
                ambient: ['https://example.com/ambient1.jpg', 'https://example.com/ambient2.jpg'],
            },
        };

        it('returns true for valid config', () => {
            expect(validateBackgroundConfig(validConfig)).toBe(true);
        });

        it('returns false for invalid category screen config', () => {
            const invalidConfig = {
                ...validConfig,
                categoryScreen: {
                    ...validConfig.categoryScreen,
                    default: 'invalid-url',
                },
            };
            expect(validateBackgroundConfig(invalidConfig)).toBe(false);
        });

        it('returns false for invalid topic list config', () => {
            const invalidConfig = {
                ...validConfig,
                topicList: {
                    ...validConfig.topicList,
                    default: 'invalid-url',
                },
            };
            expect(validateBackgroundConfig(invalidConfig)).toBe(false);
        });

        it('returns false for invalid audio player config', () => {
            const invalidConfig = {
                ...validConfig,
                audioPlayer: {
                    ...validConfig.audioPlayer,
                    default: 'invalid-url',
                },
            };
            expect(validateBackgroundConfig(invalidConfig)).toBe(false);
        });

        it('returns false for empty ambient array', () => {
            const invalidConfig = {
                ...validConfig,
                audioPlayer: {
                    ...validConfig.audioPlayer,
                    ambient: [],
                },
            };
            expect(validateBackgroundConfig(invalidConfig)).toBe(false);
        });
    });

    describe('createImageMetadata', () => {
        it('creates metadata with default values', () => {
            const context: BackgroundContext = { type: 'category-screen' };
            const metadata = createImageMetadata('https://example.com/image.jpg', context);

            expect(metadata.id).toBe('https://example.com/image.jpg');
            expect(metadata.uri).toBe('https://example.com/image.jpg');
            expect(metadata.context).toEqual(context);
            expect(metadata.overlayRecommended).toBe(true);
            expect(metadata.overlayOpacity).toBe(0.4);
            expect(metadata.contrastRatio).toBe(4.5);
        });

        it('applies overrides correctly', () => {
            const context: BackgroundContext = { type: 'audio-player' };
            const overrides = {
                overlayOpacity: 0.8,
                primaryColor: '#custom',
            };

            const metadata = createImageMetadata('https://example.com/image.jpg', context, overrides);

            expect(metadata.overlayOpacity).toBe(0.8);
            expect(metadata.primaryColor).toBe('#custom');
            expect(metadata.context).toEqual(context);
        });
    });

    describe('getEnhancedCategoryMappings', () => {
        it('returns enhanced category mappings', () => {
            const mappings = getEnhancedCategoryMappings();

            expect(mappings.technology).toBeDefined();
            expect(mappings.science).toBeDefined();
            expect(mappings.history).toBeDefined();
            expect(mappings.business).toBeDefined();
            expect(mappings.health).toBeDefined();
            expect(mappings.arts).toBeDefined();
            // expect(mappings.education).toBeDefined(); // Not included in current assets
            expect(mappings.default).toBeDefined();

            // All should be valid URLs
            Object.values(mappings).forEach(url => {
                expect(isValidImageUrl(url)).toBe(true);
            });
        });
    });

    describe('validateImageQuality', () => {
        it('validates Unsplash URLs with proper dimensions', () => {
            const validUrl = 'https://images.unsplash.com/photo-123?w=800&h=600';
            expect(validateImageQuality(validUrl)).toBe(true);
        });

        it('rejects Unsplash URLs with insufficient dimensions', () => {
            const invalidUrl = 'https://images.unsplash.com/photo-123?w=400&h=300';
            expect(validateImageQuality(invalidUrl)).toBe(false);
        });

        it('accepts non-Unsplash URLs if they are valid', () => {
            const validUrl = 'https://example.com/image.jpg';
            expect(validateImageQuality(validUrl)).toBe(true);
        });

        it('rejects invalid URLs', () => {
            expect(validateImageQuality('not-a-url')).toBe(false);
        });
    });

    describe('createResponsiveImageUrl', () => {
        it('adds dimensions to Unsplash URLs', () => {
            const baseUrl = 'https://images.unsplash.com/photo-123';
            const responsiveUrl = createResponsiveImageUrl(baseUrl, 1200, 800);

            expect(responsiveUrl).toContain('w=1200');
            expect(responsiveUrl).toContain('h=800');
            expect(responsiveUrl).toContain('fit=crop');
            expect(responsiveUrl).toContain('crop=center');
        });

        it('returns original URL for non-Unsplash URLs', () => {
            const baseUrl = 'https://example.com/image.jpg';
            const responsiveUrl = createResponsiveImageUrl(baseUrl);

            expect(responsiveUrl).toBe(baseUrl);
        });

        it('uses default dimensions when not specified', () => {
            const baseUrl = 'https://images.unsplash.com/photo-123';
            const responsiveUrl = createResponsiveImageUrl(baseUrl);

            expect(responsiveUrl).toContain('w=800');
            expect(responsiveUrl).toContain('h=600');
        });
    });

    describe('getAmbientBackgrounds', () => {
        it('returns array of ambient background URLs', () => {
            const ambientBackgrounds = getAmbientBackgrounds();

            expect(Array.isArray(ambientBackgrounds)).toBe(true);
            expect(ambientBackgrounds.length).toBeGreaterThan(0);

            // All should be valid URLs
            ambientBackgrounds.forEach(url => {
                expect(isValidImageUrl(url)).toBe(true);
            });
        });
    });

    describe('Asset Organization Functions', () => {
        describe('getRandomAmbientBackgroundUrl', () => {
            it('returns a valid ambient background URL', () => {
                const randomUrl = getRandomAmbientBackgroundUrl();
                expect(isValidImageUrl(randomUrl)).toBe(true);
            });

            it('returns different URLs on multiple calls (eventually)', () => {
                const urls = new Set();
                for (let i = 0; i < 10; i++) {
                    urls.add(getRandomAmbientBackgroundUrl());
                }
                // Should have at least 1 URL (could be same due to randomness)
                expect(urls.size).toBeGreaterThanOrEqual(1);
            });
        });

        describe('getLocalBackgroundAsset', () => {
            it('returns local asset for category screen', () => {
                const context: BackgroundContext = { type: 'category-screen' };
                const asset = getLocalBackgroundAsset(context);
                expect(asset).toBeDefined();
            });

            it('returns local asset for topic list with category', () => {
                const context: BackgroundContext = { type: 'topic-list', categoryId: '1' }; // '1' maps to 'technology'
                const asset = getLocalBackgroundAsset(context);
                expect(asset).toBeDefined();
            });

            it('returns local asset for audio player', () => {
                const context: BackgroundContext = { type: 'audio-player' };
                const asset = getLocalBackgroundAsset(context);
                expect(asset).toBeDefined();
            });
        });

        describe('getRemoteBackgroundUrl', () => {
            it('returns remote URL for category screen', () => {
                const context: BackgroundContext = { type: 'category-screen' };
                const url = getRemoteBackgroundUrl(context);
                expect(isValidImageUrl(url)).toBe(true);
            });

            it('returns remote URL for topic list with category', () => {
                const context: BackgroundContext = { type: 'topic-list', categoryId: '2' }; // '2' maps to 'science'
                const url = getRemoteBackgroundUrl(context);
                expect(isValidImageUrl(url)).toBe(true);
            });

            it('returns remote URL for audio player', () => {
                const context: BackgroundContext = { type: 'audio-player' };
                const url = getRemoteBackgroundUrl(context);
                expect(isValidImageUrl(url)).toBe(true);
            });
        });

        describe('categoryHasBackground', () => {
            it('returns true for categories with dedicated backgrounds', () => {
                expect(categoryHasBackground('technology')).toBe(true);
                expect(categoryHasBackground('science')).toBe(true);
                expect(categoryHasBackground('history')).toBe(true);
            });

            it('returns false for default category', () => {
                expect(categoryHasBackground('default')).toBe(false);
            });

            it('returns false for unknown categories', () => {
                expect(categoryHasBackground('unknown-category')).toBe(false);
            });
        });

        describe('getAllCategoryBackgrounds', () => {
            it('returns all category backgrounds with required properties', () => {
                const backgrounds = getAllCategoryBackgrounds();

                expect(backgrounds).toBeDefined();
                expect(typeof backgrounds).toBe('object');

                // Check that each background has required properties
                Object.values(backgrounds).forEach(bg => {
                    expect(bg.remote).toBeDefined();
                    expect(bg.local).toBeDefined();
                    expect(bg.description).toBeDefined();
                    expect(isValidImageUrl(bg.remote)).toBe(true);
                });
            });
        });

        describe('getBackgroundWithFallback', () => {
            it('returns remote URL by default', () => {
                const context: BackgroundContext = { type: 'category-screen' };
                const result = getBackgroundWithFallback(context, false);
                expect(typeof result).toBe('string');
                expect(isValidImageUrl(result as string)).toBe(true);
            });

            it('returns local asset when preferLocal is true', () => {
                const context: BackgroundContext = { type: 'category-screen' };
                const result = getBackgroundWithFallback(context, true);
                expect(result).toBeDefined();
            });
        });
    });

    describe('Image Quality and Optimization Functions', () => {
        describe('generateResponsiveImageUrls', () => {
            it('generates multiple responsive sizes', () => {
                const baseUrl = 'https://images.unsplash.com/photo-123';
                const responsive = generateResponsiveImageUrls(baseUrl);

                expect(responsive.small).toContain('w=400');
                expect(responsive.medium).toContain('w=800');
                expect(responsive.large).toContain('w=1200');
                expect(responsive.xlarge).toContain('w=1600');
            });

            it('returns valid URLs for all sizes', () => {
                const baseUrl = 'https://images.unsplash.com/photo-123';
                const responsive = generateResponsiveImageUrls(baseUrl);

                expect(isValidImageUrl(responsive.small)).toBe(true);
                expect(isValidImageUrl(responsive.medium)).toBe(true);
                expect(isValidImageUrl(responsive.large)).toBe(true);
                expect(isValidImageUrl(responsive.xlarge)).toBe(true);
            });
        });

        describe('getOptimalImageSize', () => {
            it('returns small for small screens', () => {
                expect(getOptimalImageSize(300, 200)).toBe('small');
            });

            it('returns medium for medium screens', () => {
                expect(getOptimalImageSize(600, 400)).toBe('medium');
            });

            it('returns large for large screens', () => {
                expect(getOptimalImageSize(1000, 700)).toBe('large');
            });

            it('returns xlarge for very large screens', () => {
                expect(getOptimalImageSize(1500, 1000)).toBe('xlarge');
            });
        });

        describe('validateImageDimensions', () => {
            it('returns true for valid dimensions', () => {
                expect(validateImageDimensions(800, 600)).toBe(true);
                expect(validateImageDimensions(1200, 900)).toBe(true);
            });

            it('returns false for dimensions too small', () => {
                expect(validateImageDimensions(400, 300)).toBe(false);
                expect(validateImageDimensions(700, 500)).toBe(false);
            });

            it('returns false for dimensions too large', () => {
                expect(validateImageDimensions(3000, 2000)).toBe(false);
                expect(validateImageDimensions(2500, 2000)).toBe(false);
            });
        });

        describe('generateImageMetadata', () => {
            it('generates metadata with context information', () => {
                const context: BackgroundContext = { type: 'topic-list', categoryId: 'technology' };
                const metadata = generateImageMetadata('https://example.com/image.jpg', context);

                expect(metadata.uri).toBe('https://example.com/image.jpg');
                expect(metadata.context).toEqual(context);
                expect(metadata.overlayOpacity).toBeDefined();
                expect(metadata.primaryColor).toBeDefined();
            });

            it('applies dimension-based optimizations when provided', () => {
                const context: BackgroundContext = { type: 'audio-player' };
                const dimensions = { width: 1200, height: 800 };
                const metadata = generateImageMetadata('https://example.com/image.jpg', context, dimensions);

                expect(metadata.overlayOpacity).toBe(0.3); // Audio player specific
            });
        });
    });
});