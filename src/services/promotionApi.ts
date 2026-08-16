import api from './api';

export interface PromotionVariant {
  id: number;
  label: string;
  pcs: string;
  price: number;
  product_id: number;
  product_name: string;
}

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: number;
  products: Array<{ id: number; name: string }>;
  variants: PromotionVariant[];
}

export interface PromotionPayload {
  name: string;
  description?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active?: number;
  product_ids?: number[];
  variant_ids?: number[];
}

export const promotionApi = {
  list: () => api.get<Promotion[]>('/api/promotions'),
  get: (id: number) => api.get<Promotion>(`/api/promotions/${id}`),
  create: (data: PromotionPayload) => api.post<{ id: number }>('/api/promotions', data),
  update: (id: number, data: PromotionPayload) => api.put(`/api/promotions/${id}`, data),
  delete: (id: number) => api.delete(`/api/promotions/${id}`),
  setProducts: (id: number, product_ids: number[]) =>
    api.post(`/api/promotions/${id}/products`, { product_ids }),
};
