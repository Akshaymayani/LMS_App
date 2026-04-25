import type { SnackbarState } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isOffline: boolean;
  snackbar: SnackbarState;
}

const initialState: UiState = {
  isOffline: false,
  snackbar: {
    visible: false,
    message: '',
    tone: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOfflineStatus(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;

      if (action.payload) {
        state.snackbar = {
          visible: true,
          message: 'You are offline. Saved content stays available locally.',
          tone: 'error',
          persistent: true,
        };
        return;
      }

      if (state.snackbar.persistent) {
        state.snackbar = {
          visible: true,
          message: 'Back online. Live sync is ready again.',
          tone: 'success',
        };
      }
    },
    showSnackbar(state, action: PayloadAction<Omit<SnackbarState, 'visible'>>) {
      state.snackbar = {
        ...action.payload,
        visible: true,
      };
    },
    hideSnackbar(state) {
      state.snackbar.visible = false;
      state.snackbar.persistent = false;
    },
  },
});

export const { setOfflineStatus, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
