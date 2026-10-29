import { api } from './client';
import type { LoginRequest, RegisterRequest } from '../types';

export async function loginApi(data: LoginRequest) {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function registerApi(data: RegisterRequest) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function refreshApi(refreshToken: string) {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data;
}
