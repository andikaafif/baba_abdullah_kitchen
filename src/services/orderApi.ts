import api from './api';

export interface OrderItem {
  id: number;
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  delivery_method: string;
  payment_method: string;
  total_price: number;
  profit: number;
  status: string;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export const orderApi = {
  list: (params?: Record<string, string>) =>
    api.get<Order[]>('/api/orders', { params }),

  get: (id: number) =>
    api.get<Order>(`/api/orders/${id}`),

  updateStatus: (id: number, status: string) =>
    api.patch(`/api/orders/${id}/status`, { status }),
};
