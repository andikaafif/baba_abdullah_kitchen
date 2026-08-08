import React from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  CircularProgress, Alert,
} from '@mui/material';
import { Construction } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/settingsApi';

const MaintenancePage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: () => settingsApi.getMaintenanceMode().then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: settingsApi.setMaintenanceMode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] }),
  });

  const enabled = data?.maintenance_mode ?? false;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Mode Maintenance</Typography>
        <Typography variant="body2" color="text.secondary">Aktifkan untuk menonaktifkan website sementara</Typography>
      </Box>

      {isLoading ? <CircularProgress /> : (
        <Card sx={{ maxWidth: 500 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Construction color={enabled ? 'warning' : 'disabled'} sx={{ fontSize: 40 }} />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {enabled ? 'Website dalam Mode Maintenance' : 'Website Aktif'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {enabled
                    ? 'Pengunjung akan melihat halaman maintenance'
                    : 'Website berjalan normal untuk semua pengunjung'}
                </Typography>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) => mutation.mutate(e.target.checked)}
                  color="warning"
                />
              }
              label={enabled ? 'Aktif' : 'Nonaktif'}
            />

            {enabled && (
              <Alert severity="warning">
                Website sedang dalam mode maintenance. Pengunjung tidak dapat mengakses halaman utama.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MaintenancePage;
