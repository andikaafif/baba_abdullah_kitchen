import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, TextField, InputAdornment,
  Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Avatar, Select, MenuItem,
  FormControl, InputLabel, TablePagination,
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../../services/productApi';
import { categoryApi } from '../../../services/productApi';

const CATEGORY_COLORS: Record<string, string> = {
  Kukus: '#4CAF50', Mentai: '#FF9800', Cheese: '#2196F3', Frozen: '#9C27B0',
};

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list().then((r) => r.data),
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', search, categoryId],
    queryFn: () =>
      productApi.list({
        ...(search && { search }),
        ...(categoryId && { category_id: categoryId }),
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
    },
  });

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manajemen Produk</Typography>
          <Typography variant="body2" color="text.secondary">Kelola semua produk menu Baba Abdullah Kitchen</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/dashboard/products/new')} sx={{ fontWeight: 700 }}>
          Tambah Produk
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', py: '12px !important' }}>
          <TextField
            placeholder="Cari produk..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 240 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Kategori</InputLabel>
            <Select label="Kategori" value={categoryId} onChange={(e) => setCategoryId(e.target.value as string)}>
              <MenuItem value="">Semua</MenuItem>
              {categories?.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Table */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>Gagal memuat produk. Pastikan backend berjalan.</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFF3E0' }}>
              <TableCell sx={{ fontWeight: 700 }}>Produk</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Kategori</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Varian</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Harga</TableCell>
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
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Belum ada produk
                </TableCell>
              </TableRow>
            ) : (
              products?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                <TableRow key={p.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#FFFAF5' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={p.photo_url ?? undefined}
                        alt={p.name}
                        variant="rounded"
                        sx={{ width: 48, height: 48, bgcolor: '#FFF3E0' }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200 }} noWrap>
                          {p.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.category_name}
                      size="small"
                      sx={{
                        bgcolor: (CATEGORY_COLORS[p.category_name] ?? '#8B4513') + '20',
                        color: CATEGORY_COLORS[p.category_name] ?? '#8B4513',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.variants?.length ?? 0} varian</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stok: {p.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {p.variants?.[0] ? formatRp(p.variants[0].price) : '-'}
                    </Typography>
                    {p.variants?.length > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        s/d {formatRp(Math.max(...p.variants.map((v) => v.price)))}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.is_active ? 'Aktif' : 'Nonaktif'}
                      size="small"
                      color={p.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/dashboard/inventory/${p.id}`)}
                      title="Inventori"
                    >
                      <InventoryIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/dashboard/products/${p.id}`)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={products?.length ?? 0}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15]}
        />
      </TableContainer>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Hapus Produk?</DialogTitle>
        <DialogContent>
          <Typography>Produk akan dinonaktifkan (soft delete). Lanjutkan?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Batal</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductListPage;
