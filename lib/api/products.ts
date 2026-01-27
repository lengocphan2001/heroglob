import { api } from '../api';

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
  createdAt: string;
  updatedAt: string;
};

export async function getProducts(category?: string): Promise<Product[]> {
  return api<Product[]>('products', {
    params: category && category !== 'all' ? { category } : {},
  });
}

/** @param identifier - numeric id or hashId (public URLs) */
export async function getProduct(identifier: string | number): Promise<Product> {
  return api<Product>(`products/${identifier}`);
}
