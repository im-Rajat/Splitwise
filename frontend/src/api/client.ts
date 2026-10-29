import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post('/api/auth/refresh', {
      refreshToken: getRefreshToken(),
    });
    const newToken = res.data.accessToken as string;
    setAccessToken(newToken);
    setRefreshToken(res.data.refreshToken as string);
    return newToken;
  } catch {
    setAccessToken(null);
    setRefreshToken(null);
    return null;
  }
}

let refreshToken: string | null = null;

export function setRefreshToken(token: string | null) {
  refreshToken = token;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 409) {
      toast.error('This record was modified by someone else. Please reload and try again.', {
        duration: Infinity,
      });
    }

    return Promise.reject(error);
  },
);
