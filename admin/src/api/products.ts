import { api, getStoredToken, API_BASE } from './client';

const PREFIX = 'products';

export type UploadImageResponse = { url: string };

export async function uploadProductImage(file: File): Promise<string> {
  const token = getStoredToken();
  const form = new FormData();
  form.append('file', file);
  const base = API_BASE.replace(/\/$/, '');
  const url = `${base}/${PREFIX}/upload/image`;
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    body: form,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Upload thất bại');
  }
  const data = (await res.json()) as UploadImageResponse;
  return data.url;
}

export type Product = {
  id: number;
  hashId: string | null;
  title: string;
  description: string | null;
  imageUrl: string;
  creatorAvatarUrl: string | null;
  creatorHandle: string;
  price: string | null;
  priceUsdt: string;
  priceHero: string;
  priceVariant: string;
  category: string;
  live: boolean;
  stock: number;
  dailyHeroReward: string;
  maxHeroReward: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductPayload = {
  title: string;
  description?: string | null;
  imageUrl: string;
  creatorAvatarUrl?: string | null;
  creatorHandle: string;
  price?: string | null;
  priceUsdt?: string;
  priceHero?: string;
  priceVariant?: 'primary' | 'dark';
  category?: string;
  live?: boolean;
  stock?: number;
  dailyHeroReward?: string;
  maxHeroReward?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export function getProducts(category?: string) {
  return api<Product[]>(PREFIX, {
    params: category && category !== 'all' ? { category } : undefined,
  });
}

export function getProduct(id: number) {
  return api<Product>(`${PREFIX}/${id}`);
}

export function createProduct(payload: CreateProductPayload) {
  return api<Product>(PREFIX, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id: number, payload: UpdateProductPayload) {
  return api<Product>(`${PREFIX}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: number) {
  return api<void>(`${PREFIX}/${id}`, { method: 'DELETE' });
}
