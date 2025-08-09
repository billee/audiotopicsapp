/**
 * CategoryScreen Integration Tests
 * 
 * Integration tests for CategoryScreen with Filipino categories
 */

import CategoryService from '../../services/categoryService';
import { FILIPINO_CATEGORIES, CATEGORY_LAYOUT_CONFIG } from '../../config/categories';

describe('CategoryScreen Integration Tests', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = CategoryService.getInstance();
    jest.clearAllMocks();
  });

  describe('Service Integration', () => {
    it('should integrate with CategoryService for data loading', () => {
      const categories = categoryService.getAllFilipinoCategories();
      const layoutConfig = categoryService.getLayoutConfig();
      
      expect(categories).toHaveLength(7);
      expect(categories).toEqual(FILIPINO_CATEGORIES);
      expect(layoutConfig).toEqual(CATEGORY_LAYOUT_CONFIG);
    });

    it('should handle category conversion for navigation', () => {
      const firstCategory = FILIPINO_CATEGORIES[0];
      
      // Simulate the conversion that happens in CategoryScreen
      const legacyCategory = {
        id: firstCategory.id,
        name: firstCategory.name,
        description: firstCategory.description,
        color: firstCategory.backgroundColor,
        topicCount: 0,
        iconUrl: firstCategory.icon,
        backgroundImageUrl: firstCategory.backgroundImage,
      };

      expect(legacyCategory).toMatchObject({
        id: 'pamilya-sariling-buhay',
        name: 'Pamilya at Sariling Buhay',
        description: 'Mga kwento tungkol sa pamilya, personal na karanasan, at sariling buhay',
        color: '#E8F5E8',
        topicCount: 0,
      });
    });
  });

  describe('Layout Integration', () => {
    it('should organize categories correctly for grid display', () => {
      const grid = categoryService.getCategoriesForLayout();
      
      // Verify grid structure
      expect(grid).toHaveLength(3);
      expect(grid[0]).toHaveLength(3); // First row
      expect(grid[1]).toHaveLength(3); // Second row
      expect(grid[2]).toHaveLength(3); // Third row (spanning category)
      
      // Verify spanning category
      const spanningCategory = grid[2][0];
      expect(spanningCategory.id).toBe('mga-alaala-nostalgia');
      expect(spanningCategory.layoutPosition.span).toBe(3);
    });

    it('should provide categories for specific rows', () => {
      const firstRowCategories = categoryService.getCategoriesForRow(0);
      const secondRowCategories = categoryService.getCategoriesForRow(1);
      const thirdRowCategories = categoryService.getCategoriesForRow(2);
      
      expect(firstRowCategories).toHaveLength(3);
      expect(secondRowCategories).toHaveLength(3);
      expect(thirdRowCategories).toHaveLength(1); // Only unique category for spanning row
      
      expect(thirdRowCategories[0].id).toBe('mga-alaala-nostalgia');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', () => {
      // Test error scenarios that the CategoryScreen would encounter
      expect(() => categoryService.getFilipinoCategory('invalid-id')).not.toThrow();
      expect(categoryService.getFilipinoCategory('invalid-id')).toBeNull();
      
      expect(() => categoryService.getFilipinoByNumericId(999)).not.toThrow();
      expect(categoryService.getFilipinoByNumericId(999)).toBeNull();
    });

    it('should provide fallback for backward compatibility', () => {
      const fallbackCategory = categoryService.mapOldCategoryToNew('unknown-category');
      expect(fallbackCategory).toBeDefined();
      expect(fallbackCategory).toBe(FILIPINO_CATEGORIES[0]);
    });
  });
});