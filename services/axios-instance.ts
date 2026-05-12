import { clearStoredSession, getStoredSession } from '@/services/auth-storage';
import { store } from '@/store';
import { clearSessionState } from '@/store/slices/authSlice';
import { showSnackbar } from '@/store/slices/uiSlice';
import { isNetworkError } from '@/utils/safe-property-access';
import axios, { type AxiosError, type AxiosInstance } from 'axios';

const API_BASE = 'https://api.freeapi.app/api/v1';
const REQUEST_TIMEOUT = 15000;

export class ApiClientError extends Error {
  statusCode?: number;
  details?: unknown;
  isNetworkError?: boolean;
}

function extractMessage(error: AxiosError<{ message?: string }>) {
  const payload = error.response?.data;

  if (payload?.message) {
    return payload.message;
  }

  if (!error.response) {
    console.error("Axios Request Error:", error);
    return error.message || 'Network connection lost. Please check your internet and try again.';
  }

  if (error.response.status >= 500) {
    return 'Server is temporarily unavailable. Please try again later.';
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'Request timed out. Please check your connection and try again.';
  }

  return error.message || 'Something went wrong while connecting to the server.';
}

function normalizeAxiosError(error: AxiosError<{ message?: string }>) {
  const normalized = new ApiClientError(extractMessage(error));
  normalized.statusCode = error.response?.status;
  normalized.isNetworkError = isNetworkError(error);
  normalized.details = error.response?.data ?? error.toJSON();

  return normalized;
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT,
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

  // Request interceptor - add auth token and check network
  axiosInstance.interceptors.request.use(
    async (config) => {
      const stateToken = store.getState().auth.token;
      const token = stateToken ?? (await getStoredSession()).token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      if (!response.data) {
        return Promise.reject(
          new ApiClientError('Received empty response from server')
        );
      }
      return response;
    },
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
      }
      else if (normalizedError.isNetworkError) {
        console.warn('[Network Error]', normalizedError.message);
        store.dispatch(
          showSnackbar({
            message: normalizedError.message,
            tone: 'error',
          })
        );
      }
      else if (error.response?.status && error.response.status >= 500) {
        console.warn('[Server Error]', normalizedError.message);
        store.dispatch(
          showSnackbar({
            message: normalizedError.message,
            tone: 'error',
          })
        );
      }
      else if (error.response?.status && error.response.status >= 400) {
        console.warn('[Client Error]', normalizedError.message);
      }
      return Promise.reject(normalizedError);
    }
  );

  interceptorsReady = true;
}

initializeAxiosInterceptors();
