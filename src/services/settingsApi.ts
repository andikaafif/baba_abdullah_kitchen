import api from './api';

export const settingsApi = {
  getMaintenanceMode: () =>
    api.get<{ maintenance_mode: boolean }>('/api/settings/maintenance'),

  setMaintenanceMode: (enabled: boolean) =>
    api.put<{ maintenance_mode: boolean }>('/api/settings/maintenance', { enabled }),
};
