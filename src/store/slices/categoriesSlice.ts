/**
 * Categories slice for managing category data and state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../types';
import {
  fetchCategories,
  fetchCategoryById,
  searchCategories,
  fetchCategoriesByPopularity,
} from '../thunks/categoryThunks';

interface CategoriesState {
  categories: Category[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.lastUpdated = Date.now();
      state.error = null;
    },
    
    addCategory: (state, action: PayloadAction<Category>) => {
      const existingIndex = state.categories.findIndex(
        cat => cat.id === action.payload.id
      );
      
      if (existingIndex >= 0) {
        state.categories[existingIndex] = action.payload;
      } else {
        state.categories.push(action.payload);
      }
      state.lastUpdated = Date.now();
    },
    
    updateCategory: (state, action: PayloadAction<Partial<Category> & { id: string }>) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index >= 0) {
        state.categories[index] = { ...state.categories[index], ...action.payload };
        state.lastUpdated = Date.now();
      }
    },
    
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
      if (state.selectedCategoryId === action.payload) {
        state.selectedCategoryId = null;
      }
      state.lastUpdated = Date.now();
    },
    
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
    },
    
    setCategoriesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setCategoriesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.loading = false;
      }
    },
    
    clearCategoriesError: (state) => {
      state.error = null;
    },
    
    resetCategories: (state) => {
      state.categories = [];
      state.selectedCategoryId = null;
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        const category = action.payload;
        const existingIndex = state.categories.findIndex(cat => cat.id === category.id);
        
        if (existingIndex >= 0) {
          state.categories[existingIndex] = category;
        } else {
          state.categories.push(category);
        }
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search categories
    builder
      .addCase(searchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch categories by popularity
    builder
      .addCase(fetchCategoriesByPopularity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByPopularity.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchCategoriesByPopularity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setSelectedCategory,
  setCategoriesLoading,
  setCategoriesError,
  clearCategoriesError,
  resetCategories,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;