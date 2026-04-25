import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';

import authReducer from '@/store/slices/authSlice';
import bookmarksReducer from '@/store/slices/bookmarksSlice';
import preferencesReducer from '@/store/slices/preferencesSlice';
import progressReducer from '@/store/slices/progressSlice';
import uiReducer from '@/store/slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  bookmarks: bookmarksReducer,
  preferences: preferencesReducer,
  progress: progressReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: 'myeducation-root',
  storage: AsyncStorage,
  whitelist: ['bookmarks', 'preferences', 'progress'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
