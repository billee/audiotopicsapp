/**
 * CategoryScreen Tests - Filipino Layout Integration
 * 
 * Tests for the updated CategoryScreen with Filipino categories and layout
 */

import React from 'react';
import CategoryService from '../../services/categoryService';
import { FILIPINO_CATEGORIES } from '../../config/categories';

describe('CategoryScreen - Filipino Layout', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = CategoryService.getInstance();
    jest.clearAllMocks();
  });

  describe('CategoryService Integration', () => {
    it('should load Filipino categories from service', () => {
      const categories = categoryService.getAllFilipinoCategories();
      expect(categories).toHaveLength(7);
      expect(categories).toEqual(FILIPINO_CATEGORIES);
    });

    it('should get layout configuration from service', () => {
      const layoutConfig = categoryService.getLayoutConfig();
      expect(layoutConfig).toHaveProperty('gridRows', 3);
      expect(layoutConfig).toHaveProperty('gridColumns', 3);
      expect(layoutConfig).toHaveProperty('cardSpacing');
      expect(layoutConfig).toHaveProperty('cardBorderRadius');
    });

    it('should convert Filipino category to legacy format for navigation', () => {
      const firstCategory = FILIPINO_CATEGORIES[0];
      
      // This simulates what the CategoryScreen does for navigation
      const legacyCategory = {
        id: firstCategory.id,
        name: firstCategory.name,
        description: firstCategory.description,
        color: firstCategory.backgroundColor,
        topicCount: 0,
        iconUrl: firstCategory.icon,
        backgroundImageUrl: firstCategory.backgroundImage,
      };

      expect(legacyCategory.id).toBe('pamilya-sariling-buhay');
      expect(legacyCategory.name).toBe('Pamilya at Sariling Buhay');
      expect(legacyCategory.description).toBe('Mga kwento tungkol sa pamilya, personal na karanasan, at sariling buhay');
      expect(legacyCategory.color).toBe('#E8F5E8');
    });

    it('should handle category selection by ID', () => {
      const category = categoryService.getFilipinoCategory('pamilya-sariling-buhay');
      expect(category).toBeDefined();
      expect(category?.name).toBe('Pamilya at Sariling Buhay');
    });

    it('should handle category selection by numeric ID', () => {
      const category = categoryService.getFilipinoByNumericId(1);
      expect(category).toBeDefined();
      expect(category?.id).toBe('pamilya-sariling-buhay');
    });
  });

  describe('Layout Configuration', () => {
    it('should organize categories for grid layout', () => {
      const grid = categoryService.getCategoriesForLayout();
      expect(grid).toHaveLength(3); // 3 rows
      
      // Check first row has 3 categories
      expect(grid[0]).toHaveLength(3);
      expect(grid[1]).toHaveLength(3);
      expect(grid[2]).toHaveLength(3); // Bottom row has spanning category in all 3 positions
      
      // But all 3 positions should reference the same category (spanning)
      expect(grid[2][0]).toBe(grid[2][1]);
      expect(grid[2][1]).toBe(grid[2][2]);
      expect(grid[2][0].id).toBe('mga-alaala-nostalgia');
    });

    it('should handle spanning category correctly', () => {
      const spanningCategory = FILIPINO_CATEGORIES.find(cat => cat.layoutPosition.span === 3);
      expect(spanningCategory).toBeDefined();
      expect(spanningCategory?.name).toBe('Mga Alaala at Nostalgia');
      expect(spanningCategory?.layoutPosition.row).toBe(2);
      expect(spanningCategory?.layoutPosition.column).toBe(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should map old category IDs to new Filipino categories', () => {
      const mappedCategory = categoryService.mapOldCategoryToNew('1');
      expect(mappedCategory).toBeDefined();
      expect(mappedCategory?.id).toBe('araw-araw-pamumuhay');
    });

    it('should provide fallback for unmapped categories', () => {
      const mappedCategory = categoryService.mapOldCategoryToNew('invalid-id');
      expect(mappedCategory).toBeDefined();
      expect(mappedCategory).toBe(FILIPINO_CATEGORIES[0]); // First category as fallback
    });
  });
});