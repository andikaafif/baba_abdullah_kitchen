import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, Button,
  IconButton, Alert, CircularProgress, Chip, InputAdornment, TablePagination,
} from '@mui/material';
import { ArrowBack, Save, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../../services/productApi';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stockEdits, setStockEdits] = useState<Record<number, { stock: string; reason: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-inventory', search],
    queryFn: () => productApi.list({ ...(search && { search }) }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: ({
      productId,
      variantId,
      stock,
      changeQty,
      reason,
    }: {
      productId: number;
      variantId: number;
      stock: number;
      changeQty: number;
      reason: string;
    }) =>
      productApi.updateInventory(productId, [
        { variant_id: variantId, stock, change_qty: changeQty, reason },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-inventory'] });
      setStockEdits({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleStockChange = (variantId: number, field: 'stock' | 'reason', value: string) => {
    setStockEdits((prev) => ({
      ...prev,
      [variantId]: { ...(prev[variantId] ?? { stock: '', reason: '' }), [field]: value },
    }));
  };

  const handleSave = (productId: number, variantId: number, originalStock: number) => {
    const edit = stockEdits[variantId];
    if (!edit) return;
    const newStock = Number(edit.stock);
    const changeQty = newStock - originalStock;
    saveMutation.mutate({ productId, variantId, stock: newStock, changeQty, reason: edit.reason || 'manual adjustment' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')}><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manajemen Inventori</Typography>
          <Typography variant="body2" color="text.secondary">Update stok per varian produk</Typography>
        </Box>
      </Box>

      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Stok berhasil diperbarui!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>Gagal memuat data. Pastikan backend berjalan.</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: '12px !important' }}>
          <TextField
            placeholder="Cari produk..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 260 }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFF3E0' }}>
              <TableCell sx={{ fontWeight: 700 }}>Produk</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Varian</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Stok Saat Ini</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Stok Baru</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Alasan</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Simpan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (() => {
              const allRows = products?.flatMap((p) =>
                (p.variants ?? []).map((v, vi) => ({ product: p, variant: v, isFirstVariant: vi === 0 }))
              ) ?? [];
              return (
                <>
                  {allRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ product: p, variant: v, isFirstVariant }) => (
                  <TableRow
                    key={v.id}
                    hover
                    sx={{ '&:nth-of-type(even)': { bgcolor: '#FFFAF5' } }}
                  >
                    <TableCell>
                      {isFirstVariant && (
                        <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{v.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.pcs}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={v.stock ?? 0}
                        size="small"
                        color={(v.stock ?? 0) < 10 ? 'error' : (v.stock ?? 0) < 20 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        placeholder={String(v.stock ?? 0)}
                        value={stockEdits[v.id!]?.stock ?? ''}
                        onChange={(e) => handleStockChange(v.id!, 'stock', e.target.value)}
                        inputProps={{ min: 0 }}
                        sx={{ width: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Keterangan..."
                        value={stockEdits[v.id!]?.reason ?? ''}
                        onChange={(e) => handleStockChange(v.id!, 'reason', e.target.value)}
                        sx={{ width: 180 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Save fontSize="small" />}
                        disabled={!stockEdits[v.id!]?.stock || saveMutation.isPending}
                        onClick={() => handleSave(p.id, v.id!, v.stock ?? 0)}
                        sx={{ fontSize: 12 }}
                      >
                        Simpan
                      </Button>
                    </TableCell>
                  </TableRow>
                  ))}
                </>
              );
            })()
            }
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={products?.flatMap((p) => p.variants ?? []).length ?? 0}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15]}
        />
      </TableContainer>
    </Box>
  );
};

export default InventoryPage;
