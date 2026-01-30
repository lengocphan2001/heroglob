const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const TOKEN_KEY = 'admin:token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${p}`;
  if (!params || Object.keys(params).length === 0) return url;
  return `${url}?${new URLSearchParams(params).toString()}`;
}

export async function api<T>(
  path: string,
  config: RequestInit & { params?: Record<string, string>; skipAuth?: boolean } = {},
): Promise<T> {
  const { params, skipAuth, ...init } = config;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as HeadersInit),
  };
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(buildUrl(path, params), {
    ...init,
    headers,
  });
  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Request failed');
  }
  if (res.status === 204) {
    return null as T;
  }
  return res.json() as Promise<T>;
}

export { BASE as API_BASE };
