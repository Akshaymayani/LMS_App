import type { ThemePreference } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PreferencesState {
  themePreference: ThemePreference;
}

const initialState: PreferencesState = {
  themePreference: 'system',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
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

export const { setThemePreference, cycleThemePreference } = preferencesSlice.actions;
export default preferencesSlice.reducer;
