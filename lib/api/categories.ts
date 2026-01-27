import { api } from '../api';

export type Category = {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export async function getCategories(): Promise<Category[]> {
  return api<Category[]>('categories');
}
