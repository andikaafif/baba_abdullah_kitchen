import api, { API_BASE } from './api';
import { useAuthStore } from '../store/authStore';

export type Period = 'daily' | 'weekly' | 'monthly';

export interface SalesPoint {
  period_label: string;
  order_count: number;
  total_revenue: number;
  total_profit?: number;
}

export interface TopVariant {
  variant_id: number;
  product_name: string;
  category_name: string;
  variant_label: string;
  pcs: string;
  total_sold: number;
  total_revenue: number;
}

export const reportApi = {
  sales: (period: Period, from?: string, to?: string) =>
    api.get<SalesPoint[]>('/api/reports/sales', { params: { period, from, to } }),

  profit: (period: Period, from?: string, to?: string) =>
    api.get<SalesPoint[]>('/api/reports/profit', { params: { period, from, to } }),

  topVariants: (params?: { category?: string; from?: string; to?: string; limit?: number }) =>
    api.get<TopVariant[]>('/api/reports/top-variants', { params }),

  salesTable: (from?: string, to?: string) =>
    api.get('/api/reports/sales/table', { params: { from, to } }),

  exportExcel: (from?: string, to?: string) => {
    const token = useAuthStore.getState().admin?.token;
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const url = `${API_BASE}/api/reports/export/excel?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `laporan_penjualan_${from ?? 'all'}_${to ?? 'all'}.xlsx`);
    if (token) {
      fetch(url, { headers: { Authorization: 'Bearer ' + token } })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          a.href = blobUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        });
    }
  },
};
