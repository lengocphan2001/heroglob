import { api } from './client';

export type Category = {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function getCategories(): Promise<Category[]> {
  return api<Category[]>('categories');
}

export type CreateCategoryPayload = {
  slug: string;
  name: string;
  sortOrder?: number;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export function createCategory(payload: CreateCategoryPayload) {
  return api<Category>('categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id: number, payload: UpdateCategoryPayload) {
  return api<Category>(`categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id: number) {
  return api<void>(`categories/${id}`, { method: 'DELETE' });
}
