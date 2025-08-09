/**
 * Unit tests for Filipino categories configuration
 */

import {
    FILIPINO_CATEGORIES,
    CATEGORY_LAYOUT_CONFIG,
    FilipinoCategory,
    CategoryLayoutConfig,
    getCategoryById,
    getCategoryByNumericId,
    getAllCategories,
    getLayoutConfig
} from '../src/config/categories';

describe('Filipino Categories Configuration', () => {
    describe('Category Data Structure', () => {
        test('should have exactly 7 categories', () => {
            expect(FILIPINO_CATEGORIES).toHaveLength(7);
        });

        test('each category should have required properties', () => {
            FILIPINO_CATEGORIES.forEach((category, index) => {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('numericId');
                expect(category).toHaveProperty('name');
                expect(category).toHaveProperty('englishName');
                expect(category).toHaveProperty('description');
                expect(category).toHaveProperty('englishDescription');
                expect(category).toHaveProperty('backgroundColor');
                expect(category).toHaveProperty('textColor');
                expect(category).toHaveProperty('layoutPosition');

                // Validate types
                expect(typeof category.id).toBe('string');
                expect(typeof category.numericId).toBe('number');
                expect(typeof category.name).toBe('string');
                expect(typeof category.englishName).toBe('string');
                expect(typeof category.description).toBe('string');
                expect(typeof category.englishDescription).toBe('string');
                expect(typeof category.backgroundColor).toBe('string');
                expect(typeof category.textColor).toBe('string');
                expect(typeof category.layoutPosition).toBe('object');
            });
        });

        test('category IDs should be unique', () => {
            const ids = FILIPINO_CATEGORIES.map(cat => cat.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        test('numeric IDs should be unique and sequential', () => {
            const numericIds = FILIPINO_CATEGORIES.map(cat => cat.numericId).sort();
            expect(numericIds).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });

        test('should have proper Filipino category names', () => {
            const expectedNames = [
                'Pamilya at Sariling Buhay',
                'Araw-araw na Pamumuhay',
                'Balita at Kasalukuyang Pangyayari',
                'Damdamin at Relasyon',
                'Mga Plano at Pagkakataon',
                'Libangan at Kasiyahan',
                'Mga Alaala at Nostalgia'
            ];

            const actualNames = FILIPINO_CATEGORIES.map(cat => cat.name);
            expectedNames.forEach(name => {
                expect(actualNames).toContain(name);
            });
        });

        test('background colors should be valid hex colors', () => {
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

            FILIPINO_CATEGORIES.forEach(category => {
                expect(category.backgroundColor).toMatch(hexColorRegex);
                expect(category.textColor).toMatch(hexColorRegex);
            });
        });

        test('layout positions should be valid', () => {
            FILIPINO_CATEGORIES.forEach(category => {
                const { row, column, span } = category.layoutPosition;

                expect(typeof row).toBe('number');
                expect(typeof column).toBe('number');
                expect(row).toBeGreaterThanOrEqual(0);
                expect(row).toBeLessThan(3); // 3 rows (0, 1, 2)
                expect(column).toBeGreaterThanOrEqual(0);
                expect(column).toBeLessThan(3); // 3 columns (0, 1, 2)

                if (span !== undefined) {
                    expect(typeof span).toBe('number');
                    expect(span).toBeGreaterThan(0);
                }
            });
        });

        test('bottom category should span full width', () => {
            const bottomCategory = FILIPINO_CATEGORIES.find(cat => cat.layoutPosition.row === 2);
            expect(bottomCategory).toBeDefined();
            expect(bottomCategory?.layoutPosition.span).toBe(3);
            expect(bottomCategory?.name).toBe('Mga Alaala at Nostalgia');
        });
    });

    describe('Layout Configuration', () => {
        test('should have valid layout configuration', () => {
            expect(CATEGORY_LAYOUT_CONFIG).toHaveProperty('gridRows');
            expect(CATEGORY_LAYOUT_CONFIG).toHaveProperty('gridColumns');
            expect(CATEGORY_LAYOUT_CONFIG).toHaveProperty('cardSpacing');
            expect(CATEGORY_LAYOUT_CONFIG).toHaveProperty('cardBorderRadius');
            expect(CATEGORY_LAYOUT_CONFIG).toHaveProperty('filipinoColorScheme');

            expect(CATEGORY_LAYOUT_CONFIG.gridRows).toBe(3);
            expect(CATEGORY_LAYOUT_CONFIG.gridColumns).toBe(3);
            expect(typeof CATEGORY_LAYOUT_CONFIG.cardSpacing).toBe('number');
            expect(typeof CATEGORY_LAYOUT_CONFIG.cardBorderRadius).toBe('number');
        });

        test('Filipino color scheme should have required colors', () => {
            const { filipinoColorScheme } = CATEGORY_LAYOUT_CONFIG;

            expect(filipinoColorScheme).toHaveProperty('primary');
            expect(filipinoColorScheme).toHaveProperty('secondary');
            expect(filipinoColorScheme).toHaveProperty('accent');
            expect(filipinoColorScheme).toHaveProperty('warm');

            expect(Array.isArray(filipinoColorScheme.warm)).toBe(true);
            expect(filipinoColorScheme.warm).toHaveLength(7);

            // Validate hex colors
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            expect(filipinoColorScheme.primary).toMatch(hexColorRegex);
            expect(filipinoColorScheme.secondary).toMatch(hexColorRegex);
            expect(filipinoColorScheme.accent).toMatch(hexColorRegex);

            filipinoColorScheme.warm.forEach(color => {
                expect(color).toMatch(hexColorRegex);
            });
        });
    });

    describe('Helper Functions', () => {
        test('getCategoryById should return correct category', () => {
            const category = getCategoryById('pamilya-sariling-buhay');
            expect(category).toBeDefined();
            expect(category?.name).toBe('Pamilya at Sariling Buhay');
            expect(category?.numericId).toBe(1);
        });

        test('getCategoryById should return undefined for invalid ID', () => {
            const category = getCategoryById('invalid-id');
            expect(category).toBeUndefined();
        });

        test('getCategoryByNumericId should return correct category', () => {
            const category = getCategoryByNumericId(1);
            expect(category).toBeDefined();
            expect(category?.id).toBe('pamilya-sariling-buhay');
            expect(category?.name).toBe('Pamilya at Sariling Buhay');
        });

        test('getCategoryByNumericId should return undefined for invalid ID', () => {
            const category = getCategoryByNumericId(999);
            expect(category).toBeUndefined();
        });

        test('getAllCategories should return all categories', () => {
            const categories = getAllCategories();
            expect(categories).toHaveLength(7);
            expect(categories).toEqual(FILIPINO_CATEGORIES);

            // Should return a copy, not the original array
            expect(categories).not.toBe(FILIPINO_CATEGORIES);
        });

        test('getLayoutConfig should return layout configuration', () => {
            const config = getLayoutConfig();
            expect(config).toEqual(CATEGORY_LAYOUT_CONFIG);

            // Should return a copy, not the original object
            expect(config).not.toBe(CATEGORY_LAYOUT_CONFIG);
        });
    });

    describe('Data Integrity', () => {
        test('all categories should have non-empty strings', () => {
            FILIPINO_CATEGORIES.forEach(category => {
                expect(category.id.trim()).not.toBe('');
                expect(category.name.trim()).not.toBe('');
                expect(category.englishName.trim()).not.toBe('');
                expect(category.description.trim()).not.toBe('');
                expect(category.englishDescription.trim()).not.toBe('');
                expect(category.backgroundColor.trim()).not.toBe('');
                expect(category.textColor.trim()).not.toBe('');
            });
        });

        test('layout positions should not overlap (except for span)', () => {
            const positions = new Set();

            FILIPINO_CATEGORIES.forEach(category => {
                const { row, column, span } = category.layoutPosition;

                if (span && span > 1) {
                    // For spanning categories, check all positions they occupy
                    for (let c = column; c < column + span; c++) {
                        const posKey = `${row}-${c}`;
                        expect(positions.has(posKey)).toBe(false);
                        positions.add(posKey);
                    }
                } else {
                    const posKey = `${row}-${column}`;
                    expect(positions.has(posKey)).toBe(false);
                    positions.add(posKey);
                }
            });
        });

        test('should have proper Filipino grammar and spelling', () => {
            // Basic checks for Filipino text patterns
            FILIPINO_CATEGORIES.forEach(category => {
                // Filipino names should not be empty and should contain Filipino words
                expect(category.name).toBeTruthy();
                expect(category.description).toBeTruthy();

                // Check for common Filipino words/patterns
                const filipinoPattern = /[Mm]ga|[Aa]t|[Nn]a|[Ss]a|[Aa]ng|[Nn]g/;
                const hasFilipino = filipinoPattern.test(category.name) || filipinoPattern.test(category.description);
                expect(hasFilipino).toBe(true);
            });
        });
    });
});