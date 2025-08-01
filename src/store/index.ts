/**
 * Redux store configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import categoriesReducer from './slices/categoriesSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';
import topicsReducer from './slices/topicsSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';

// Define the root state type first
export type RootState = {
  audio: ReturnType<typeof audioReducer>;
  categories: ReturnType<typeof categoriesReducer>;
  userPreferences: ReturnType<typeof userPreferencesReducer>;
  topics: ReturnType<typeof topicsReducer>;
};

const store = configureStore({
  reducer: {
    audio: audioReducer,
    categories: categoriesReducer,
    userPreferences: userPreferencesReducer,
    topics: topicsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['userPreferences.progressData'],
      },
    }).concat(persistenceMiddleware),
});

export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';
export * from './thunks/categoryThunks';
export * from './thunks/topicThunks';

export default store;