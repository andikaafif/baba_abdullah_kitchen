import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingZoneApi, type ShippingZone } from '../../../services/shippingZoneApi';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const ShippingZonesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingZone | null>(null);
  const [form, setForm] = useState({ zone_name: '', shipping_cost: 0 });

  const { data: zones, isLoading } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => shippingZoneApi.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: shippingZoneApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipping-zones'] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { zone_name: string; shipping_cost: number } }) => shippingZoneApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipping-zones'] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: shippingZoneApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipping-zones'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ zone_name: '', shipping_cost: 0 }); setDialogOpen(true); };
  const openEdit = (z: ShippingZone) => { setEditing(z); setForm({ zone_name: z.zone_name, shipping_cost: z.shipping_cost }); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm({ zone_name: '', shipping_cost: 0 }); };

  const handleSave = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Zona Pengiriman</Typography>
          <Typography variant="body2" color="text.secondary">Kelola zona dan biaya pengiriman</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd} sx={{ fontWeight: 700 }}>
          Tambah Zona
        </Button>
      </Box>

      {isLoading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama Zona</TableCell>
                <TableCell align="right">Biaya Kirim</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones?.map((z) => (
                <TableRow key={z.id}>
                  <TableCell>{z.zone_name}</TableCell>
                  <TableCell align="right">{formatRp(z.shipping_cost)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(z)} title="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(z.id)} title="Hapus">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!zones || zones.length === 0) && (
                <TableRow><TableCell colSpan={3} align="center">Belum ada zona pengiriman</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit Zona' : 'Tambah Zona'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Nama Zona" value={form.zone_name} onChange={(e) => setForm({ ...form, zone_name: e.target.value })} fullWidth />
          <TextField label="Biaya Kirim (Rp)" type="number" value={form.shipping_cost} onChange={(e) => setForm({ ...form, shipping_cost: Number(e.target.value) })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.zone_name}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShippingZonesPage;
