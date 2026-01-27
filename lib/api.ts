import { API_URL } from './constants';

type RequestConfig = RequestInit & { params?: Record<string, string> };

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = API_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${p}`;
  if (!params || Object.keys(params).length === 0) return url;
  const search = new URLSearchParams(params).toString();
  return `${url}?${search}`;
}

export async function api<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config;
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export { API_URL };
