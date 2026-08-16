import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  CircularProgress, Alert, TextField, Button, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper,
} from '@mui/material';
import { Construction, StorefrontOutlined, Delete, Edit } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type OutOfStockSetting } from '../../../services/settingsApi';

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

  // ─── Out-of-Stock Settings ───
  const { data: oosData, isLoading: loadingOos } = useQuery({
    queryKey: ['out-of-stock-settings'],
    queryFn: () => settingsApi.getOutOfStockSettings().then(r => r.data),
  });
  const oosMutation = useMutation({
    mutationFn: settingsApi.setOutOfStockSetting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['out-of-stock-settings'] }),
  });
  const oosDeleteMutation = useMutation({
    mutationFn: settingsApi.deleteOutOfStockSetting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['out-of-stock-settings'] }),
  });

  const [editDialog, setEditDialog] = useState<OutOfStockSetting | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [editRestockAt, setEditRestockAt] = useState('');

  const openEditDialog = (item: OutOfStockSetting) => {
    setEditDialog(item);
    setEditMessage(item.message || '');
    setEditRestockAt(item.restock_at ? item.restock_at.slice(0, 16) : '');
  };

  const handleSaveOos = () => {
    if (!editDialog) return;
    oosMutation.mutate({
      variant_id: editDialog.variant_id,
      product_id: editDialog.product_id,
      message: editMessage,
      restock_at: editRestockAt || null,
    }, { onSuccess: () => setEditDialog(null) });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Maintenance & Toko</Typography>
        <Typography variant="body2" color="text.secondary">Kelola mode maintenance, penutupan toko, dan produk habis</Typography>
      </Box>

      {/* ─── Section 1: Maintenance Mode ─── */}
      {loadingMaintenance ? <CircularProgress /> : (
        <Card sx={{ maxWidth: 600, mb: 4 }}>
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
                  onChange={(e) => maintenanceMutation.mutate(e.target.checked)}
                  color="warning"
                />
              }
              label={maintenanceEnabled ? 'Aktif' : 'Nonaktif'}
            />
          </CardContent>
        </Card>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* ─── Section 2: Store Closure ─── */}
      {loadingClosure ? <CircularProgress /> : (
        <Card sx={{ maxWidth: 600, mb: 4 }}>
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

            <TextField
              label="Pesan untuk pelanggan"
              fullWidth
              multiline
              minRows={2}
              value={effectiveClosureMessage}
              onChange={(e) => setClosureMessage(e.target.value)}
              placeholder="Contoh: Toko tutup sementara untuk libur Lebaran"
            />

            <TextField
              label="Buka kembali pada"
              type="datetime-local"
              fullWidth
              value={effectiveReopenAt}
              onChange={(e) => setClosureReopenAt(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Button
              variant="contained"
              onClick={() => closureMutation.mutate({
                enabled: closureData?.enabled ?? false,
                message: effectiveClosureMessage,
                reopen_at: effectiveReopenAt || null,
              })}
              disabled={closureMutation.isPending}
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

      <Divider sx={{ mb: 4 }} />

      {/* ─── Section 3: Out-of-Stock Items ─── */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Pengaturan Produk Habis (Out of Stock)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Kustomisasi pesan dan jadwal restock untuk produk yang stoknya habis.
      </Typography>

      {loadingOos ? <CircularProgress /> : (
        <>
          {(!oosData || oosData.length === 0) ? (
            <Alert severity="info" sx={{ maxWidth: 600 }}>
              Belum ada pengaturan khusus untuk produk habis. Pengaturan otomatis ditambahkan ketika stok varian menjadi 0.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxWidth: 900 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Produk</strong></TableCell>
                    <TableCell><strong>Varian</strong></TableCell>
                    <TableCell><strong>Pesan</strong></TableCell>
                    <TableCell><strong>Restock</strong></TableCell>
                    <TableCell align="right"><strong>Aksi</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {oosData.map((item) => (
                    <TableRow key={item.variant_id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.variant_label}</TableCell>
                      <TableCell>{item.message || <em style={{ opacity: 0.5 }}>—</em>}</TableCell>
                      <TableCell>
                        {item.restock_at
                          ? new Date(item.restock_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                          : <em style={{ opacity: 0.5 }}>—</em>}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEditDialog(item)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => oosDeleteMutation.mutate(item.variant_id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ─── Edit OOS Dialog ─── */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Pengaturan Produk Habis</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{editDialog?.product_name}</strong> — {editDialog?.variant_label}
          </Typography>
          <TextField
            label="Pesan kustom untuk pelanggan"
            fullWidth
            multiline
            minRows={2}
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            placeholder="Contoh: Stok habis, estimasi restock Senin depan"
          />
          <TextField
            label="Estimasi restock"
            type="datetime-local"
            fullWidth
            value={editRestockAt}
            onChange={(e) => setEditRestockAt(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Batal</Button>
          <Button variant="contained" onClick={handleSaveOos} disabled={oosMutation.isPending}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenancePage;
