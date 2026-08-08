import api from './api';

export interface AdminUser {
  id: number;
  username: string;
  created_at: string;
}

export const userApi = {
  list: () => api.get<AdminUser[]>('/api/users'),

  create: (data: { username: string; password: string }) =>
    api.post('/api/users', data),

  changePassword: (id: number, password: string) =>
    api.put(`/api/users/${id}/password`, { password }),

  remove: (id: number) =>
    api.delete(`/api/users/${id}`),
};
