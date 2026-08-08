import api from './api';

export interface ShippingZone {
  id: number;
  zone_name: string;
  shipping_cost: number;
  created_at: string;
}

export const shippingZoneApi = {
  list: () => api.get<ShippingZone[]>('/api/shipping-zones'),

  create: (data: { zone_name: string; shipping_cost: number }) =>
    api.post('/api/shipping-zones', data),

  update: (id: number, data: { zone_name: string; shipping_cost: number }) =>
    api.put(`/api/shipping-zones/${id}`, data),

  remove: (id: number) =>
    api.delete(`/api/shipping-zones/${id}`),
};
