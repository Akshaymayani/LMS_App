import type { ThemePreference } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PreferencesState {
  notificationsEnabled: boolean;
  themePreference: ThemePreference;
}

const initialState: PreferencesState = {
  notificationsEnabled: true,
  themePreference: 'system',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    cycleThemePreference(state) {
      if (state.themePreference === 'system') {
        state.themePreference = 'light';
        return;
      }

      if (state.themePreference === 'light') {
        state.themePreference = 'dark';
        return;
      }

      state.themePreference = 'system';
    },
  },
});

export const { setNotificationsEnabled, setThemePreference, cycleThemePreference } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
