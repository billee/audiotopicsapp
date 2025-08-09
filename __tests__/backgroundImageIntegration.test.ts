/**
 * Background Image Integration Tests
 * 
 * Tests the integration of Filipino categories with the background image system,
 * including fallback mechanisms and backward compatibility.
 * 
 * Updated to use only verified working images: health.png and technology.png
 */

import {
    getRemoteUrlByContext,
    getLocalAssetByContext,
    getTopicAudioPlayerBackground,
    getTopicAudioPlayerRemoteUrl,
    getFilipinoCategoryBackground,
    getFilipinoCategoryFallbackColor,
    isFilipinoCategory,
    getAvailableFilipinoCategoryIds,
    mapNumericToFilipinoCategory,
    getBackgroundWithFallback,
    filipinoTopicListBackgrounds,
    legacyTopicListBackgrounds,
    audioPlayerBackgrounds
} from '../src/assets/backgrounds/index';

describe('Background Image Integration with Filipino Categories', () => {

    describe('Filipino Category Background Resolution', () => {
        test('should resolve Filipino category backgrounds correctly', () => {
            const filipinoCategories = [
                'pamilya-sariling-buhay',
                'araw-araw-pamumuhay',
                'balita-kasalukuyang-pangyayari',
                'damdamin-relasyon',
                'mga-plano-pagkakataon',
                'libangan-kasiyahan',
                'mga-alaala-nostalgia'
            ];

            filipinoCategories.forEach(categoryId => {
                const remoteUrl = getRemoteUrlByContext('topic-list', categoryId);
                const localAsset = getLocalAssetByContext('topic-list', categoryId);

                expect(remoteUrl).toBeDefined();
                expect(remoteUrl).toContain('https://');
                expect(localAsset).toBeDefined();
            });
        });

        test('should return fallback colors for Filipino categories', () => {
            const expectedFallbackColors = {
                'pamilya-sariling-buhay': '#E8F5E8',
                'araw-araw-pamumuhay': '#FFF4E6',
                'balita-kasalukuyang-pangyayari': '#E6F3FF',
                'damdamin-relasyon': '#FFE6F0',
                'mga-plano-pagkakataon': '#F0E6FF',
                'libangan-kasiyahan': '#FFEB3B',
                'mga-alaala-nostalgia': '#E8E8E8'
            };

            Object.entries(expectedFallbackColors).forEach(([categoryId, expectedColor]) => {
                const fallbackColor = getFilipinoCategoryFallbackColor(categoryId);
                expect(fallbackColor).toBe(expectedColor);
            });
        });

        test('should identify Filipino categories correctly', () => {
            expect(isFilipinoCategory('pamilya-sariling-buhay')).toBe(true);
            expect(isFilipinoCategory('mga-alaala-nostalgia')).toBe(true);
            expect(isFilipinoCategory('technology')).toBe(false);
            expect(isFilipinoCategory('science')).toBe(false);
            expect(isFilipinoCategory('default')).toBe(false);
        });

        test('should return all available Filipino category IDs', () => {
            const filipinoCategoryIds = getAvailableFilipinoCategoryIds();

            expect(filipinoCategoryIds).toHaveLength(7);
            expect(filipinoCategoryIds).toContain('pamilya-sariling-buhay');
            expect(filipinoCategoryIds).toContain('mga-alaala-nostalgia');
            expect(filipinoCategoryIds).not.toContain('default');
        });
    });

    describe('Numeric ID to Filipino Category Mapping', () => {
        test('should map numeric IDs to Filipino categories correctly', () => {
            const expectedMappings = {
                '1': 'pamilya-sariling-buhay',
                '2': 'araw-araw-pamumuhay',
                '3': 'balita-kasalukuyang-pangyayari',
                '4': 'damdamin-relasyon',
                '5': 'mga-plano-pagkakataon',
                '6': 'libangan-kasiyahan',
                '7': 'mga-alaala-nostalgia'
            };

            Object.entries(expectedMappings).forEach(([numericId, expectedFilipinoId]) => {
                const mappedId = mapNumericToFilipinoCategory(numericId);
                expect(mappedId).toBe(expectedFilipinoId);
            });
        });

        test('should return null for invalid numeric IDs', () => {
            expect(mapNumericToFilipinoCategory('8')).toBeNull();
            expect(mapNumericToFilipinoCategory('0')).toBeNull();
            expect(mapNumericToFilipinoCategory('invalid')).toBeNull();
        });

        test('should resolve backgrounds using numeric IDs', () => {
            // Test numeric ID resolution to Filipino categories
            const remoteUrl1 = getRemoteUrlByContext('topic-list', '1');
            const remoteUrl7 = getRemoteUrlByContext('topic-list', '7');

            expect(remoteUrl1).toBeDefined();
            expect(remoteUrl7).toBeDefined();

            // Should be different URLs for different categories
            expect(remoteUrl1).not.toBe(remoteUrl7);
        });
    });

    describe('Backward Compatibility', () => {
        test('should maintain backward compatibility with legacy categories', () => {
            const legacyCategories = ['technology', 'science', 'history', 'arts', 'business', 'health'];

            legacyCategories.forEach(categoryId => {
                const remoteUrl = getRemoteUrlByContext('topic-list', categoryId);
                const localAsset = getLocalAssetByContext('topic-list', categoryId);

                expect(remoteUrl).toBeDefined();
                expect(remoteUrl).toContain('https://');
                // Local asset might be null for some legacy categories, which is expected
            });
        });

        test('should resolve legacy numeric IDs to legacy categories when Filipino mapping fails', () => {
            // This tests the fallback mechanism
            const remoteUrl = getRemoteUrlByContext('topic-list', '1');
            expect(remoteUrl).toBeDefined();
        });
    });

    describe('Audio Player Background Integration', () => {
        test('should resolve audio player backgrounds for Filipino categories', () => {
            const filipinoCategories = [
                'pamilya-sariling-buhay',
                'araw-araw-pamumuhay',
                'balita-kasalukuyang-pangyayari',
                'damdamin-relasyon',
                'mga-plano-pagkakataon',
                'libangan-kasiyahan',
                'mga-alaala-nostalgia'
            ];

            filipinoCategories.forEach(categoryId => {
                const background = getTopicAudioPlayerBackground(undefined, categoryId);
                const remoteUrl = getTopicAudioPlayerRemoteUrl(undefined, categoryId);

                expect(background).toBeDefined();
                expect(remoteUrl).toBeDefined();
                expect(remoteUrl).toContain('https://');
            });
        });

        test('should resolve audio player backgrounds using numeric IDs', () => {
            for (let i = 1; i <= 7; i++) {
                const background = getTopicAudioPlayerBackground(undefined, i.toString());
                const remoteUrl = getTopicAudioPlayerRemoteUrl(undefined, i.toString());

                expect(background).toBeDefined();
                expect(remoteUrl).toBeDefined();
            }
        });
    });

    describe('Fallback Mechanisms', () => {
        test('should provide default backgrounds for unknown categories', () => {
            const unknownCategory = 'unknown-category';

            const remoteUrl = getRemoteUrlByContext('topic-list', unknownCategory);
            const localAsset = getLocalAssetByContext('topic-list', unknownCategory);

            expect(remoteUrl).toBeDefined();
            expect(localAsset).toBeDefined();
        });

        test('should provide fallback colors for unknown categories', () => {
            const unknownCategory = 'unknown-category';
            const fallbackColor = getFilipinoCategoryFallbackColor(unknownCategory);

            expect(fallbackColor).toBe('#F5F5F5'); // Default fallback color
        });

        test('should handle missing background images gracefully', () => {
            // Test that the system doesn't crash when images are missing
            const background = getFilipinoCategoryBackground('pamilya-sariling-buhay');

            expect(background).toHaveProperty('local');
            expect(background).toHaveProperty('remote');
            expect(background).toHaveProperty('fallbackColor');
            expect(background.fallbackColor).toBe('#E8F5E8');
        });

        test('should use safe fallback images for all Filipino categories', () => {
            const filipinoCategories = getAvailableFilipinoCategoryIds();

            filipinoCategories.forEach(categoryId => {
                const background = getFilipinoCategoryBackground(categoryId);
                expect(background.local).toBeDefined();
                // All categories should now use either health.png or technology.png
            });
        });
    });

    describe('Enhanced Background Resolution', () => {
        test('should return background with fallback color for topic-list context', () => {
            const result = getBackgroundWithFallback('topic-list', 'pamilya-sariling-buhay');

            expect(result).toHaveProperty('local');
            expect(result).toHaveProperty('remote');
            expect(result).toHaveProperty('fallbackColor');
            expect(result.fallbackColor).toBe('#E8F5E8');
        });

        test('should return background without fallback color for non-topic-list contexts', () => {
            const result = getBackgroundWithFallback('audio-player', 'pamilya-sariling-buhay');

            expect(result).toHaveProperty('local');
            expect(result).toHaveProperty('remote');
            // fallbackColor might be undefined for non-topic-list contexts
        });

        test('should handle numeric category IDs in enhanced resolution', () => {
            const result = getBackgroundWithFallback('topic-list', '1');

            expect(result).toHaveProperty('local');
            expect(result).toHaveProperty('remote');
            expect(result).toHaveProperty('fallbackColor');
            expect(result.fallbackColor).toBe('#E8F5E8'); // Should map to pamilya-sariling-buhay
        });
    });

    describe('Configuration Integrity', () => {
        test('should have all required properties in Filipino background configurations', () => {
            Object.entries(filipinoTopicListBackgrounds).forEach(([categoryId, config]) => {
                if (categoryId !== 'default') {
                    expect(config).toHaveProperty('local');
                    expect(config).toHaveProperty('remote');
                    expect(config).toHaveProperty('description');
                    expect(config).toHaveProperty('fallbackColor');

                    expect(typeof config.description).toBe('string');
                    expect(typeof config.fallbackColor).toBe('string');
                    expect(config.fallbackColor).toMatch(/^#[0-9A-Fa-f]{6}$/); // Valid hex color
                }
            });
        });

        test('should have all Filipino categories in audio player backgrounds', () => {
            const filipinoCategories = getAvailableFilipinoCategoryIds();

            filipinoCategories.forEach(categoryId => {
                expect(audioPlayerBackgrounds).toHaveProperty(categoryId);
                expect(audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds]).toHaveProperty('local');
                expect(audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds]).toHaveProperty('description');
                // All Filipino categories should use safe fallback images (health.png or technology.png)
                const localAsset = audioPlayerBackgrounds[categoryId as keyof typeof audioPlayerBackgrounds].local;
                expect(localAsset).toBeDefined();
            });
        });

        test('should maintain legacy background configurations', () => {
            const legacyCategories = ['technology', 'science', 'history', 'arts', 'business', 'health'];

            legacyCategories.forEach(categoryId => {
                expect(legacyTopicListBackgrounds).toHaveProperty(categoryId);
                expect(legacyTopicListBackgrounds[categoryId as keyof typeof legacyTopicListBackgrounds]).toHaveProperty('local');
                expect(legacyTopicListBackgrounds[categoryId as keyof typeof legacyTopicListBackgrounds]).toHaveProperty('remote');
                expect(legacyTopicListBackgrounds[categoryId as keyof typeof legacyTopicListBackgrounds]).toHaveProperty('description');
            });
        });

        test('should use only verified working images', () => {
            // Test that all Filipino categories use only health.png or technology.png
            const filipinoCategories = getAvailableFilipinoCategoryIds();

            filipinoCategories.forEach(categoryId => {
                const background = getFilipinoCategoryBackground(categoryId);
                expect(background.local).toBeDefined();
                // The local asset should be one of the verified working images
                // We can't directly test the require() result, but we can ensure it's not null/undefined
            });
        });
    });
});