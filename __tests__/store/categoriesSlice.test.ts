/**
 * Tests for categories slice
 */

import categoriesReducer, {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setSelectedCategory,
  setCategoriesLoading,
  setCategoriesError,
  clearCategoriesError,
  resetCategories,
} from '../../src/store/slices/categoriesSlice';
import { Category } from '../../src/types';

const mockCategory: Category = {
  id: '1',
  name: 'Test Category',
  description: 'Test Description',
  iconUrl: 'https://example.com/icon.png',
  backgroundImageUrl: 'https://example.com/bg.jpg',
  topicCount: 5,
  color: '#FF0000',
};

const mockCategories: Category[] = [
  mockCategory,
  {
    ...mockCategory,
    id: '2',
    name: 'Category 2',
    topicCount: 3,
  },
  {
    ...mockCategory,
    id: '3',
    name: 'Category 3',
    topicCount: 0,
  },
];

describe('categoriesSlice', () => {
  const initialState = {
    categories: [],
    selectedCategoryId: null,
    loading: false,
    error: null,
    lastUpdated: null,
  };

  it('should return the initial state', () => {
    expect(categoriesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCategories', () => {
    it('should set categories and update timestamp', () => {
      const beforeTime = Date.now();
      const actual = categoriesReducer(initialState, setCategories(mockCategories));
      const afterTime = Date.now();

      expect(actual.categories).toEqual(mockCategories);
      expect(actual.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(actual.lastUpdated).toBeLessThanOrEqual(afterTime);
      expect(actual.error).toBeNull();
    });

    it('should clear error when setting categories', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const actual = categoriesReducer(stateWithError, setCategories(mockCategories));
      expect(actual.error).toBeNull();
    });
  });

  describe('addCategory', () => {
    it('should add new category', () => {
      const actual = categoriesReducer(initialState, addCategory(mockCategory));
      expect(actual.categories).toHaveLength(1);
      expect(actual.categories[0]).toEqual(mockCategory);
      expect(actual.lastUpdated).toBeTruthy();
    });

    it('should update existing category', () => {
      const stateWithCategory = { ...initialState, categories: [mockCategory] };
      const updatedCategory = { ...mockCategory, name: 'Updated Name' };
      
      const actual = categoriesReducer(stateWithCategory, addCategory(updatedCategory));
      expect(actual.categories).toHaveLength(1);
      expect(actual.categories[0].name).toBe('Updated Name');
    });
  });

  describe('updateCategory', () => {
    it('should update existing category', () => {
      const stateWithCategories = { ...initialState, categories: mockCategories };
      const update = { id: '1', name: 'Updated Category' };
      
      const actual = categoriesReducer(stateWithCategories, updateCategory(update));
      expect(actual.categories[0].name).toBe('Updated Category');
      expect(actual.categories[0].description).toBe(mockCategory.description); // Other fields preserved
      expect(actual.lastUpdated).toBeTruthy();
    });

    it('should not update non-existent category', () => {
      const stateWithCategories = { ...initialState, categories: mockCategories };
      const update = { id: 'non-existent', name: 'Updated Category' };
      
      const actual = categoriesReducer(stateWithCategories, updateCategory(update));
      expect(actual.categories).toEqual(mockCategories);
    });
  });

  describe('removeCategory', () => {
    it('should remove category', () => {
      const stateWithCategories = { ...initialState, categories: mockCategories };
      
      const actual = categoriesReducer(stateWithCategories, removeCategory('2'));
      expect(actual.categories).toHaveLength(2);
      expect(actual.categories.find(cat => cat.id === '2')).toBeUndefined();
      expect(actual.lastUpdated).toBeTruthy();
    });

    it('should clear selected category if removed', () => {
      const stateWithSelection = {
        ...initialState,
        categories: mockCategories,
        selectedCategoryId: '2',
      };
      
      const actual = categoriesReducer(stateWithSelection, removeCategory('2'));
      expect(actual.selectedCategoryId).toBeNull();
    });

    it('should not affect selected category if different category removed', () => {
      const stateWithSelection = {
        ...initialState,
        categories: mockCategories,
        selectedCategoryId: '1',
      };
      
      const actual = categoriesReducer(stateWithSelection, removeCategory('2'));
      expect(actual.selectedCategoryId).toBe('1');
    });
  });

  describe('setSelectedCategory', () => {
    it('should set selected category', () => {
      const actual = categoriesReducer(initialState, setSelectedCategory('1'));
      expect(actual.selectedCategoryId).toBe('1');
    });

    it('should clear selected category', () => {
      const stateWithSelection = { ...initialState, selectedCategoryId: '1' };
      const actual = categoriesReducer(stateWithSelection, setSelectedCategory(null));
      expect(actual.selectedCategoryId).toBeNull();
    });
  });

  describe('loading state', () => {
    it('should set loading state', () => {
      const actual = categoriesReducer(initialState, setCategoriesLoading(true));
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should clear loading state', () => {
      const loadingState = { ...initialState, loading: true };
      const actual = categoriesReducer(loadingState, setCategoriesLoading(false));
      expect(actual.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error and stop loading', () => {
      const loadingState = { ...initialState, loading: true };
      const actual = categoriesReducer(loadingState, setCategoriesError('Test error'));
      expect(actual.error).toBe('Test error');
      expect(actual.loading).toBe(false);
    });

    it('should clear error', () => {
      const errorState = { ...initialState, error: 'Test error' };
      const actual = categoriesReducer(errorState, clearCategoriesError());
      expect(actual.error).toBeNull();
    });
  });

  describe('resetCategories', () => {
    it('should reset all state', () => {
      const complexState = {
        categories: mockCategories,
        selectedCategoryId: '1',
        loading: true,
        error: 'Some error',
        lastUpdated: Date.now(),
      };

      const actual = categoriesReducer(complexState, resetCategories());
      expect(actual).toEqual(initialState);
    });
  });
});