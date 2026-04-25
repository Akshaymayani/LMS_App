import { clearStoredSession, getStoredSession } from '@/services/auth-storage';
import { store } from '@/store';
import { clearSessionState } from '@/store/slices/authSlice';
import { showSnackbar } from '@/store/slices/uiSlice';
import axios, { type AxiosError, type AxiosInstance } from 'axios';

const API_BASE = 'https://api.freeapi.app/api/v1';

export class ApiClientError extends Error {
  statusCode?: number;
  details?: unknown;
}

function extractMessage(error: AxiosError<{ message?: string }>) {
  const payload = error.response?.data;

  if (payload?.message) {
    return payload.message;
  }

  if (!error.response) {
    return 'Unable to reach FreeAPI. Check your internet connection.';
  }

  if (error.response.status >= 500) {
    return 'FreeAPI is temporarily unavailable. Please try again.';
  }

  return error.message || 'Something went wrong while talking to FreeAPI.';
}

function normalizeAxiosError(error: AxiosError<{ message?: string }>) {
  const normalized = new ApiClientError(extractMessage(error));
  normalized.statusCode = error.response?.status;
  normalized.details = error.response?.data ?? error.toJSON();

  return normalized;
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let interceptorsReady = false;

export function initializeAxiosInterceptors() {
  if (interceptorsReady) {
    return;
  }

  axiosInstance.interceptors.request.use(async (config) => {
    const stateToken = store.getState().auth.token;
    const token = stateToken ?? (await getStoredSession()).token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string }>) => {
      const normalizedError = normalizeAxiosError(error);

      if (error.response?.status === 401) {
        await clearStoredSession();
        store.dispatch(clearSessionState());
        store.dispatch(
          showSnackbar({
            message: 'Your session expired. Please sign in again.',
            tone: 'error',
          })
        );
      } else if (!error.response) {
        store.dispatch(
          showSnackbar({
            message: normalizedError.message,
            tone: 'error',
          })
        );
      } else if (error.response.status >= 500) {
        store.dispatch(
          showSnackbar({
            message: normalizedError.message,
            tone: 'error',
          })
        );
      }

      return Promise.reject(normalizedError);
    }
  );

  interceptorsReady = true;
}

initializeAxiosInterceptors();
