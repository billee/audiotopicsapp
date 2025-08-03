/**
 * Redux store configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import categoriesReducer from './slices/categoriesSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';
import topicsReducer from './slices/topicsSlice';
import progressReducer from './slices/progressSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';

// Define the root state type first
export type RootState = {
  audio: ReturnType<typeof audioReducer>;
  categories: ReturnType<typeof categoriesReducer>;
  userPreferences: ReturnType<typeof userPreferencesReducer>;
  topics: ReturnType<typeof topicsReducer>;
  progress: ReturnType<typeof progressReducer>;
};

const store = configureStore({
  reducer: {
    audio: audioReducer,
    categories: categoriesReducer,
    userPreferences: userPreferencesReducer,
    topics: topicsReducer,
    progress: progressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'progress/setProgressData',
          'progress/loadProgressData/fulfilled',
          'progress/updateProgress/fulfilled',
          'progress/updateProgress/pending',
        ],
        ignoredPaths: [
          'userPreferences.progressData', 
          'progress.progressData',
          'progress.progressMap',
        ],
        // Ignore Date-related paths during development
        ignoredActionsPaths: [
          'payload.publishDate', 
          'meta.arg.publishDate', 
          'payload.lastPlayed',
          'payload.progressMap',
          'payload.hist-2.lastPlayed',
          'payload.sci-1.lastPlayed',
          'payload.tech-1.lastPlayed',
          'payload.tech-2.lastPlayed',
        ],
      },
    }),
    // Temporarily disabled persistence middleware to fix 500 error
    // .concat(persistenceMiddleware),
});

export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';
export * from './thunks/categoryThunks';
export * from './thunks/topicThunks';
export * from './thunks/progressThunks';

export default store;