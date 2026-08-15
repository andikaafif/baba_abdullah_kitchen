import api from './api';

export interface Expense {
  id: number;
  purpose: string;
  quantity: number;
  original_price: number;
  expense_cost: number;
  created_at: string;
}

export interface ExpenseSummary {
  period_label: string;
  item_count: number;
  total_expense: number;
  last_entry_at?: string;
}

export type ExpensePeriod = 'daily' | 'weekly' | 'monthly';

export const expenseApi = {
  list: (from?: string, to?: string) =>
    api.get<Expense[]>('/api/expenses', { params: { from, to } }),

  summary: (period: ExpensePeriod, from?: string, to?: string) =>
    api.get<ExpenseSummary[]>('/api/expenses/summary', { params: { period, from, to } }),

  create: (data: { purpose: string; quantity: number; original_price: number }) =>
    api.post('/api/expenses', data),

  remove: (id: number) =>
    api.delete(`/api/expenses/${id}`),
};
