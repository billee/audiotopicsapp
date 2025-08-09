/**
 * Category Service - Handles category data loading and management
 * Updated to support Filipino categories with backward compatibility
 */

import {
    FILIPINO_CATEGORIES,
    CATEGORY_LAYOUT_CONFIG,
    FilipinoCategory,
    CategoryLayoutConfig
} from '../config/categories';
import { Category } from '../types';

/**
 * Mapping from old English category IDs to new Filipino category IDs
 */
const OLD_TO_NEW_CATEGORY_MAPPING: Record<string, string> = {
    '1': 'araw-araw-pamumuhay', // Technology -> Daily Life & Local Culture
    '2': 'balita-kasalukuyang-pangyayari', // Science -> News & Current Events  
    '3': 'mga-alaala-nostalgia', // History -> Shared Nostalgia
    '4': 'libangan-kasiyahan', // Arts & Culture -> Entertainment & Fun
    '5': 'mga-plano-pagkakataon', // Business -> Plans & Opportunities
    '6': 'pamilya-sariling-buhay', // Health & Wellness -> Personal & Family Life
    // Additional mapping for any other old categories
    'technology': 'araw-araw-pamumuhay',
    'science': 'balita-kasalukuyang-pangyayari',
    'history': 'mga-alaala-nostalgia',
    'arts': 'libangan-kasiyahan',
    'business': 'mga-plano-pagkakataon',
    'health': 'pamilya-sariling-buhay'
};

class CategoryService {
    private static instance: CategoryService;

    private constructor() {
        // Private constructor for singleton pattern
    }

    public static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }
        return CategoryService.instance;
    }

    /**
     * Get all categories in legacy format (for backward compatibility)
     * This method maintains the same signature as the original CategoryService
     */
    public async getCategories(): Promise<Category[]> {
        // Simulate network delay like the original
        await new Promise(resolve => setTimeout(resolve, 500));
        return FILIPINO_CATEGORIES.map(cat => this.convertToLegacyCategory(cat));
    }

    /**
     * Get category by ID in legacy format (for backward compatibility)
     */
    public async getCategoryById(id: string): Promise<Category | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const filipinoCategory = FILIPINO_CATEGORIES.find(cat => cat.id === id);
        return filipinoCategory ? this.convertToLegacyCategory(filipinoCategory) : null;
    }

    /**
     * Search categories in legacy format (for backward compatibility)
     */
    public async searchCategories(query: string): Promise<Category[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        const lowercaseQuery = query.toLowerCase().trim();
        if (!lowercaseQuery) {
            return [];
        }

        const matchingCategories = FILIPINO_CATEGORIES.filter(category =>
            category.name.toLowerCase().includes(lowercaseQuery) ||
            category.description.toLowerCase().includes(lowercaseQuery) ||
            category.englishName.toLowerCase().includes(lowercaseQuery) ||
            category.englishDescription.toLowerCase().includes(lowercaseQuery)
        );

        return matchingCategories.map(cat => this.convertToLegacyCategory(cat));
    }

    /**
     * Get categories by popularity in legacy format (for backward compatibility)
     */
    public async getCategoriesByPopularity(): Promise<Category[]> {
        const categories = await this.getCategories();
        return categories.sort((a, b) => b.topicCount - a.topicCount);
    }

    /**
     * Convert Filipino category to legacy Category format for backward compatibility
     */
    private convertToLegacyCategory(filipinoCategory: FilipinoCategory): Category {
        return {
            id: filipinoCategory.id,
            name: filipinoCategory.name,
            description: filipinoCategory.description,
            color: filipinoCategory.backgroundColor,
            topicCount: 0, // This would need to be calculated based on actual topics
            iconUrl: filipinoCategory.icon,
            backgroundImageUrl: filipinoCategory.backgroundImage
        };
    }

    // Additional Filipino-specific methods (for future use)

    /**
     * Get all Filipino categories
     */
    public getAllFilipinoCategories(): FilipinoCategory[] {
        return [...FILIPINO_CATEGORIES];
    }

    /**
     * Get category by Filipino ID
     */
    public getFilipinoCategory(id: string): FilipinoCategory | null {
        const category = FILIPINO_CATEGORIES.find(cat => cat.id === id);
        return category || null;
    }

    /**
     * Get category by numeric ID (for backward compatibility)
     */
    public getFilipinoByNumericId(numericId: number): FilipinoCategory | null {
        const category = FILIPINO_CATEGORIES.find(cat => cat.numericId === numericId);
        return category || null;
    }

    /**
     * Map old category ID to new Filipino category
     */
    public mapOldCategoryToNew(oldCategoryId: string): FilipinoCategory | null {
        const newCategoryId = OLD_TO_NEW_CATEGORY_MAPPING[oldCategoryId.toLowerCase()];
        if (!newCategoryId) {
            // If no mapping found, return the first category as fallback
            return FILIPINO_CATEGORIES[0];
        }
        return this.getFilipinoCategory(newCategoryId);
    }

    /**
     * Get layout configuration
     */
    public getLayoutConfig(): CategoryLayoutConfig {
        return { ...CATEGORY_LAYOUT_CONFIG };
    }

    /**
     * Get categories arranged for grid layout
     * Returns a 2D array representing the grid structure
     */
    public getCategoriesForLayout(): FilipinoCategory[][] {
        const config = this.getLayoutConfig();
        const grid: FilipinoCategory[][] = [];

        // Initialize grid
        for (let row = 0; row < config.gridRows; row++) {
            grid[row] = [];
        }

        // Place categories in their designated positions
        FILIPINO_CATEGORIES.forEach(category => {
            const { row, column, span = 1 } = category.layoutPosition;
            if (row < config.gridRows && column < config.gridColumns) {
                grid[row][column] = category;

                // Handle spanning categories (like the bottom full-width category)
                if (span > 1) {
                    for (let i = 1; i < span; i++) {
                        if (column + i < config.gridColumns) {
                            grid[row][column + i] = category; // Reference same category for spanning
                        }
                    }
                }
            }
        });

        return grid;
    }

    /**
     * Get categories for a specific row in the layout
     */
    public getCategoriesForRow(rowIndex: number): FilipinoCategory[] {
        const grid = this.getCategoriesForLayout();
        if (rowIndex >= 0 && rowIndex < grid.length) {
            const row = grid[rowIndex].filter(Boolean); // Remove empty slots
            // For spanning categories, return only unique categories
            const uniqueCategories = row.filter((category, index, arr) =>
                arr.findIndex(c => c.id === category.id) === index
            );
            return uniqueCategories;
        }
        return [];
    }

    /**
     * Get category background image path
     */
    public getCategoryBackground(categoryId: string): string | null {
        const category = this.getFilipinoCategory(categoryId);
        return category?.backgroundImage || null;
    }
}

export default CategoryService;