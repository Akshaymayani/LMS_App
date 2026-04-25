import { clearStoredSession, getStoredSession } from '@/services/auth-storage';
import type { AuthPayload, AuthUser } from '@/types';
import { normalizeAuthSession } from '@/utils/auth-session';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
}

const initialState: AuthState = {
  user: null,
  token: null,
  hydrated: false,
  status: 'idle',
};

function applySessionState(
  state: AuthState,
  session: {
    token: string | null;
    user: AuthUser | null;
  }
) {
  state.user = session.user;
  state.token = session.token;
  state.hydrated = true;
  state.status = session.token && session.user ? 'authenticated' : 'anonymous';
}

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  return getStoredSession();
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await clearStoredSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthPayload>) {
      applySessionState(
        state,
        normalizeAuthSession({
          token: action.payload.accessToken,
          user: action.payload.user,
        })
      );
    },
    updateProfile(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = normalizeAuthSession({
        token: state.token,
        user: action.payload,
      }).token
        ? 'authenticated'
        : 'anonymous';
    },
    clearSessionState(state) {
      state.user = null;
      state.token = null;
      state.hydrated = true;
      state.status = 'anonymous';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        applySessionState(state, normalizeAuthSession(action.payload));
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.hydrated = true;
        state.status = 'anonymous';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.hydrated = true;
        state.status = 'anonymous';
      });
  },
});

export const { setSession, updateProfile, clearSessionState } = authSlice.actions;
export default authSlice.reducer;
