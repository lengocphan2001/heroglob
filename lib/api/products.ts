import { api } from '@/lib/api';

export type Product = {
  id: number;
  hashId: string | null;
  title: string;
  description: string | null;
  imageUrl: string;
  creatorHandle: string;
  creatorAvatarUrl: string | null;
  price: string;
  priceUsdt: string;
  priceHero: string;
  priceVariant: string;
  tokenType: string;
  category: string;
  categoryId: number | null;
  isFeatured: boolean;
  live: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type UserProduct = {
  productId: number;
  hashId: string | null;
  title: string;
  description: string | null;
  imageUrl: string;
  creatorHandle: string;
  creatorAvatarUrl: string | null;
  quantity: number;
  totalSpent: number;
  lastPurchased: string;
};

export async function getProducts(category?: string): Promise<Product[]> {
  const params = category ? { category } : undefined;
  return api<Product[]>('products', { params });
}

export async function getProduct(id: string): Promise<Product> {
  return api<Product>(`products/${id}`);
}

export async function getMyProducts(): Promise<UserProduct[]> {
  return api<UserProduct[]>('nfts/my-nfts');
}
