/**
 * Category-related async thunks
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import CategoryService from '../../services/CategoryService';
import { Category } from '../../types';

const categoryService = CategoryService.getInstance();

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch categories'
      );
    }
  }
);

// Fetch category by ID
export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const category = await categoryService.getCategoryById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch category'
      );
    }
  }
);

// Search categories
export const searchCategories = createAsyncThunk(
  'categories/searchCategories',
  async (query: string, { rejectWithValue }) => {
    try {
      const categories = await categoryService.searchCategories(query);
      return categories;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to search categories'
      );
    }
  }
);

// Fetch categories by popularity
export const fetchCategoriesByPopularity = createAsyncThunk(
  'categories/fetchCategoriesByPopularity',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategoriesByPopularity();
      return categories;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch popular categories'
      );
    }
  }
);