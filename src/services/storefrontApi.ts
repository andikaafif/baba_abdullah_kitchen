import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Public (no auth) API client for the storefront */
const publicApi = axios.create({ baseURL: API_BASE });

export interface PublicProduct {
  id: number;
  name: string;
  photo_url: string | null;
  category_id: number;
  category_name: string;
  description: string | null;
  is_active: number;
  variants: Array<{
    id: number;
    label: string;
    pcs: string;
    price: number;
    stock: number;
  }>;
}

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PublicShippingZone {
  id: number;
  zone_name: string;
  shipping_cost: number;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  delivery_method: string;
  payment_method: string;
  notes?: string;
  items: Array<{
    product_variant_id?: number;
    product_name: string;
    variant_label: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface PublicPromotion {
  id: number;
  name: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  product_ids: number[];
  variant_ids: number[];
}

export const storefrontApi = {
  /** Get active products with variants */
  getProducts: () =>
    publicApi.get<PublicProduct[]>('/api/products', { params: { is_active: '1' } }),

  /** Get all categories */
  getCategories: () =>
    publicApi.get<PublicCategory[]>('/api/categories'),

  /** Get shipping zones */
  getShippingZones: () =>
    publicApi.get<PublicShippingZone[]>('/api/shipping-zones'),

  /** Get active promotions */
  getActivePromotions: () =>
    publicApi.get<PublicPromotion[]>('/api/promotions/active'),

  /** Check maintenance mode */
  getMaintenanceMode: () =>
    publicApi.get<{ maintenance_mode: boolean }>('/api/settings/maintenance'),

  /** Place an order */
  createOrder: (data: CreateOrderPayload) =>
    publicApi.post<{ id: number; order_number: string; total_price: number }>('/api/orders', data),
};
