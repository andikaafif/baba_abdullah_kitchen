import api from './api';

export interface StoreClosure {
  enabled: boolean;
  message: string;
  reopen_at: string | null;
}

export interface OutOfStockSetting {
  id: number;
  variant_id: number;
  product_id: number;
  product_name: string;
  variant_label: string;
  message: string | null;
  restock_at: string | null;
  updated_at: string;
}

export const settingsApi = {
  getMaintenanceMode: () =>
    api.get<{ maintenance_mode: boolean }>('/api/settings/maintenance'),

  setMaintenanceMode: (enabled: boolean) =>
    api.put<{ maintenance_mode: boolean }>('/api/settings/maintenance', { enabled }),

  getStoreClosure: () =>
    api.get<StoreClosure>('/api/settings/store-closure'),

  setStoreClosure: (data: { enabled: boolean; message: string; reopen_at: string | null }) =>
    api.put<StoreClosure>('/api/settings/store-closure', data),

  getOutOfStockSettings: () =>
    api.get<OutOfStockSetting[]>('/api/settings/out-of-stock'),

  setOutOfStockSetting: (data: { variant_id: number; product_id: number; message: string; restock_at: string | null }) =>
    api.put('/api/settings/out-of-stock', data),

  deleteOutOfStockSetting: (variantId: number) =>
    api.delete(`/api/settings/out-of-stock/${variantId}`),
};
