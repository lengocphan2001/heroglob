import { api } from './client';

const AUTH_PREFIX = 'auth';

export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export type MeResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export function login(email: string, password: string) {
  return api<LoginResponse>(`${AUTH_PREFIX}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export function getMe() {
  return api<MeResponse>(`${AUTH_PREFIX}/me`);
}
