/**
 * CategoryService tests
 */

import CategoryService from '../CategoryService';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = CategoryService.getInstance();
  });

  it('implements singleton pattern', () => {
    const instance1 = CategoryService.getInstance();
    const instance2 = CategoryService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('returns categories from getCategories', async () => {
    const categories = await categoryService.getCategories();
    
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    // Check structure of first category
    const firstCategory = categories[0];
    expect(firstCategory).toHaveProperty('id');
    expect(firstCategory).toHaveProperty('name');
    expect(firstCategory).toHaveProperty('description');
    expect(firstCategory).toHaveProperty('topicCount');
    expect(firstCategory).toHaveProperty('color');
  });

  it('returns specific category by ID', async () => {
    const categories = await categoryService.getCategories();
    const firstCategoryId = categories[0].id;
    
    const category = await categoryService.getCategoryById(firstCategoryId);
    
    expect(category).not.toBeNull();
    expect(category?.id).toBe(firstCategoryId);
  });

  it('returns null for non-existent category ID', async () => {
    const category = await categoryService.getCategoryById('non-existent-id');
    expect(category).toBeNull();
  });

  it('searches categories by name', async () => {
    const searchResults = await categoryService.searchCategories('tech');
    
    expect(Array.isArray(searchResults)).toBe(true);
    
    // Should find categories with 'tech' in name or description
    const hasMatchingCategory = searchResults.some(category =>
      category.name.toLowerCase().includes('tech') ||
      category.description.toLowerCase().includes('tech')
    );
    expect(hasMatchingCategory).toBe(true);
  });

  it('returns empty array for non-matching search', async () => {
    const searchResults = await categoryService.searchCategories('xyz123nonexistent');
    expect(searchResults).toEqual([]);
  });

  it('returns categories sorted by popularity', async () => {
    const popularCategories = await categoryService.getCategoriesByPopularity();
    
    expect(Array.isArray(popularCategories)).toBe(true);
    expect(popularCategories.length).toBeGreaterThan(0);
    
    // Check if sorted by topic count (descending)
    for (let i = 0; i < popularCategories.length - 1; i++) {
      expect(popularCategories[i].topicCount).toBeGreaterThanOrEqual(
        popularCategories[i + 1].topicCount
      );
    }
  });

  it('simulates network delay', async () => {
    const startTime = Date.now();
    await categoryService.getCategories();
    const endTime = Date.now();
    
    // Should take at least 500ms due to simulated delay
    expect(endTime - startTime).toBeGreaterThanOrEqual(500);
  });

  it('handles case-insensitive search', async () => {
    const lowerCaseResults = await categoryService.searchCategories('technology');
    const upperCaseResults = await categoryService.searchCategories('TECHNOLOGY');
    const mixedCaseResults = await categoryService.searchCategories('Technology');
    
    expect(lowerCaseResults).toEqual(upperCaseResults);
    expect(upperCaseResults).toEqual(mixedCaseResults);
  });

  it('searches in both name and description', async () => {
    const categories = await categoryService.getCategories();
    
    // Find a category with a unique word in description
    const categoryWithUniqueDescription = categories.find(cat =>
      cat.description.includes('discoveries')
    );
    
    if (categoryWithUniqueDescription) {
      const searchResults = await categoryService.searchCategories('discoveries');
      expect(searchResults).toContain(categoryWithUniqueDescription);
    }
  });
});