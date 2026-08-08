import api from './api';

export interface ProductVariant {
  id?: number;
  label: string;
  pcs: string;
  price: number;
  cost_price?: number;
  stock?: number;
}

export interface Product {
  id: number;
  name: string;
  photo_url: string | null;
  category_id: number;
  category_name: string;
  description: string | null;
  is_active: number;
  variants: ProductVariant[];
}

export const productApi = {
  list: (params?: Record<string, string>) => api.get<Product[]>('/api/products', { params }),
  get: (id: number) => api.get<Product>(`/api/products/${id}`),
  create: (formData: FormData) => api.post<{ id: number }>('/api/products', formData),
  update: (id: number, formData: FormData) => api.put<{ id: number }>(`/api/products/${id}`, formData),
  delete: (id: number) => api.delete(`/api/products/${id}`),
  updateInventory: (id: number, variants: Array<{ variant_id: number; stock: number; change_qty?: number; reason?: string }>) =>
    api.patch(`/api/products/${id}/inventory`, { variants }),
};

export const categoryApi = {
  list: () => api.get<Array<{ id: number; name: string; slug: string }>>('/api/categories'),
  create: (data: { name: string; slug: string }) => api.post('/api/categories', data),
  update: (id: number, data: { name: string; slug: string }) => api.put(`/api/categories/${id}`, data),
  delete: (id: number) => api.delete(`/api/categories/${id}`),
};
