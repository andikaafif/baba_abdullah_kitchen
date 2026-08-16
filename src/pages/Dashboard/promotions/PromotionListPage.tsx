import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionApi } from '../../../services/promotionApi';

const PromotionListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: promotions, isLoading, error } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setDeleteId(null);
    },
  });

  const now = new Date().toISOString().slice(0, 10);
  const isExpired = (p: { end_date: string }) => p.end_date < now;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manajemen Promosi</Typography>
          <Typography variant="body2" color="text.secondary">Kelola promo berbasis event untuk produk pilihan</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/dashboard/promotions/new')} sx={{ fontWeight: 700 }}>
          Tambah Promo
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Gagal memuat data. Pastikan backend berjalan.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFF3E0' }}>
              <TableCell sx={{ fontWeight: 700 }}>Nama Promo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Diskon</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Periode</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Produk</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : promotions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Belum ada promosi
                </TableCell>
              </TableRow>
            ) : (
              promotions?.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#FFFAF5' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                    {p.description && (
                      <Typography variant="caption" color="text.secondary">{p.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        p.discount_type === 'percent'
                          ? `${p.discount_value}%`
                          : `Rp ${Number(p.discount_value).toLocaleString('id-ID')}`
                      }
                      size="small"
                      sx={{ bgcolor: '#FFF3E0', color: '#8B4513', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.start_date}</Typography>
                    <Typography variant="caption" color="text.secondary">s/d {p.end_date}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.products?.length ?? 0} produk</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                      {p.products?.slice(0, 2).map((pr) => pr.name).join(', ')}
                      {(p.products?.length ?? 0) > 2 ? `, +${(p.products?.length ?? 0) - 2}` : ''}
                    </Typography>
                    {(p.variants?.length ?? 0) > 0 && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                        + {p.variants.length} varian spesifik
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isExpired(p) ? (
                      <Chip label="Kedaluwarsa" size="small" color="default" />
                    ) : p.is_active ? (
                      <Chip label="Aktif" size="small" color="success" />
                    ) : (
                      <Chip label="Nonaktif" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => navigate(`/dashboard/promotions/${p.id}`)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Hapus Promosi?</DialogTitle>
        <DialogContent>
          <Typography>Promo ini akan dihapus permanen. Lanjutkan?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Batal</Button>
          <Button
            color="error" variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromotionListPage;
