import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  CircularProgress, Alert, TextField, Button,
} from '@mui/material';
import { Construction, StorefrontOutlined } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/settingsApi';

const MaintenancePage: React.FC = () => {
  const queryClient = useQueryClient();

  // ─── Maintenance Mode ───
  const { data: maintenanceData, isLoading: loadingMaintenance } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: () => settingsApi.getMaintenanceMode().then(r => r.data),
  });
  const maintenanceMutation = useMutation({
    mutationFn: settingsApi.setMaintenanceMode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] }),
  });
  const maintenanceEnabled = maintenanceData?.maintenance_mode ?? false;

  // ─── Store Closure ───
  const { data: closureData, isLoading: loadingClosure } = useQuery({
    queryKey: ['store-closure'],
    queryFn: () => settingsApi.getStoreClosure().then(r => r.data),
  });
  const closureMutation = useMutation({
    mutationFn: settingsApi.setStoreClosure,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-closure'] }),
  });
  const [closureMessage, setClosureMessage] = useState<string | null>(null);
  const [closureReopenAt, setClosureReopenAt] = useState<string | null>(null);

  const effectiveClosureMessage = closureMessage ?? closureData?.message ?? 'Toko sedang tutup';
  const effectiveReopenAt = closureReopenAt ?? closureData?.reopen_at ?? '';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Maintenance & Toko</Typography>
        <Typography variant="body2" color="text.secondary">Kelola mode maintenance dan penutupan toko</Typography>
      </Box>

      {/* ─── Single row: Maintenance + Store Closure ─── */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        {/* Maintenance Mode */}
        {loadingMaintenance ? <CircularProgress /> : (
          <Card sx={{ flex: '1 1 360px', minWidth: 320 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Construction color={maintenanceEnabled ? 'warning' : 'disabled'} sx={{ fontSize: 40 }} />
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Mode Maintenance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {maintenanceEnabled
                      ? 'Website dalam mode maintenance — pengunjung tidak bisa akses'
                      : 'Website berjalan normal'}
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintenanceEnabled}
                    onChange={(e) => {
                      if (e.target.checked && closureData?.enabled) {
                        closureMutation.mutate({ enabled: false, message: effectiveClosureMessage, reopen_at: effectiveReopenAt || null });
                      }
                      maintenanceMutation.mutate(e.target.checked);
                    }}
                    color="warning"
                  />
                }
                label={maintenanceEnabled ? 'Aktif' : 'Nonaktif'}
              />
              {maintenanceEnabled && closureData?.enabled && (
                <Alert severity="info" variant="outlined">Mode Tutup Toko dinonaktifkan karena Maintenance aktif.</Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Store Closure */}
        {loadingClosure ? <CircularProgress /> : (
          <Card sx={{ flex: '1 1 360px', minWidth: 320 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StorefrontOutlined color={closureData?.enabled ? 'error' : 'disabled'} sx={{ fontSize: 40 }} />
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Tutup Toko
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tutup toko sementara — pelanggan tidak bisa memesan
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={closureData?.enabled ?? false}
                    disabled={maintenanceEnabled}
                    onChange={(e) => closureMutation.mutate({
                      enabled: e.target.checked,
                      message: effectiveClosureMessage,
                      reopen_at: effectiveReopenAt || null,
                    })}
                    color="error"
                  />
                }
                label={closureData?.enabled ? 'Toko Tutup' : 'Toko Buka'}
              />
              {maintenanceEnabled && (
                <Alert severity="info" variant="outlined">Tidak bisa diaktifkan saat Maintenance aktif.</Alert>
              )}

              <TextField
                label="Pesan untuk pelanggan"
                fullWidth
                multiline
                minRows={2}
                value={effectiveClosureMessage}
                onChange={(e) => setClosureMessage(e.target.value)}
                placeholder="Contoh: Toko tutup sementara untuk libur Lebaran"
                disabled={maintenanceEnabled}
              />

              <TextField
                label="Buka kembali pada"
                type="datetime-local"
                fullWidth
                value={effectiveReopenAt}
                onChange={(e) => setClosureReopenAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={maintenanceEnabled}
              />

              <Button
                variant="contained"
                onClick={() => closureMutation.mutate({
                  enabled: closureData?.enabled ?? false,
                  message: effectiveClosureMessage,
                  reopen_at: effectiveReopenAt || null,
                })}
                disabled={closureMutation.isPending || maintenanceEnabled}
              >
                Simpan Pengaturan
              </Button>

              {closureData?.enabled && (
                <Alert severity="error">
                  Toko sedang ditutup. Pelanggan tidak dapat melakukan pemesanan.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MaintenancePage;
