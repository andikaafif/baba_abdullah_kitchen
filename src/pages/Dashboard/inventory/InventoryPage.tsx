import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, Button,
  IconButton, Alert, CircularProgress, Chip, InputAdornment, TablePagination,
  Collapse, Checkbox,
} from '@mui/material';
import { ArrowBack, Save, Search, AddBox, Close, LocalShipping, RemoveShoppingCart } from '@mui/icons-material';
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

  // Bulk incoming stock state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkApplied, setBulkApplied] = useState(false);

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
      setBulkApplied(false);
      setBulkQty('');
      setBulkNotes('');
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

  const handleBulkApply = () => {
    const qty = Number(bulkQty);
    if (!qty || !products) return;
    const allVariants = products.flatMap((p) => (p.variants ?? []).filter((v) => v.id != null));
    const variantCount = allVariants.length;
    if (variantCount === 0) return;
    const perVariant = Math.floor(qty / variantCount);
    const remainder = qty % variantCount;
    const newEdits: Record<number, { stock: string; reason: string }> = {};
    allVariants.forEach((v, i) => {
      const addition = perVariant + (i < remainder ? 1 : 0);
      newEdits[v.id!] = {
        stock: String((v.stock ?? 0) + addition),
        reason: bulkNotes || `Stok masuk +${addition} (dari total ${qty})`,
      };
    });
    setStockEdits(newEdits);
    setBulkApplied(true);
  };

  const handleBulkCancel = () => {
    setStockEdits({});
    setBulkApplied(false);
    setBulkQty('');
    setBulkNotes('');
  };

  // Count how many "Stok Baru" fields are filled
  const filledEditsCount = Object.values(stockEdits).filter((e) => e.stock !== '').length;

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      if (!products) return;
      const groupedByProduct: Record<number, Array<{ variant_id: number; stock: number; change_qty: number; reason: string }>> = {};
      for (const p of products) {
        for (const v of p.variants ?? []) {
          const edit = v.id != null ? stockEdits[v.id] : undefined;
          if (edit && edit.stock !== '') {
            if (!groupedByProduct[p.id]) groupedByProduct[p.id] = [];
            const newStock = Number(edit.stock);
            groupedByProduct[p.id].push({
              variant_id: v.id!,
              stock: newStock,
              change_qty: newStock - (v.stock ?? 0),
              reason: edit.reason || 'manual adjustment',
            });
          }
        }
      }
      for (const [productId, variants] of Object.entries(groupedByProduct)) {
        await productApi.updateInventory(Number(productId), variants);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-inventory'] });
      setStockEdits({});
      setSaveSuccess(true);
      setBulkApplied(false);
      setBulkQty('');
      setBulkNotes('');
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

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

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 260 }}>
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
        <Button
          variant={bulkOpen ? 'outlined' : 'contained'}
          startIcon={bulkOpen ? <Close /> : <AddBox />}
          onClick={() => { setBulkOpen(!bulkOpen); if (bulkOpen) handleBulkCancel(); }}
          sx={{ fontWeight: 700, alignSelf: 'center' }}
        >
          {bulkOpen ? 'Tutup' : 'Stok Masuk Otomatis'}
        </Button>
      </Box>

      <Collapse in={bulkOpen}>
        <Card sx={{ mb: 2, border: '2px solid #D4A373', bgcolor: '#FFFAF5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocalShipping sx={{ color: '#8B4513' }} />
              <Typography variant="subtitle1" fontWeight={700} color="#8B4513">
                Stok Masuk Otomatis
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Masukkan total jumlah stok masuk. Stok akan dibagi rata ke semua varian yang tersedia. Hasil akan ditampilkan di kolom "Stok Baru" sebagai preview sebelum disimpan.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField
                label="Jumlah Stok Masuk"
                type="number"
                size="small"
                value={bulkQty}
                onChange={(e) => setBulkQty(e.target.value)}
                inputProps={{ min: 1 }}
                sx={{ width: 180 }}
                disabled={bulkApplied}
              />
              <TextField
                label="Catatan"
                size="small"
                placeholder="Contoh: Restok dari supplier"
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                sx={{ width: 280 }}
                disabled={bulkApplied}
              />
              {!bulkApplied ? (
                <Button
                  variant="contained"
                  onClick={handleBulkApply}
                  disabled={!bulkQty || Number(bulkQty) <= 0}
                  sx={{ fontWeight: 700, alignSelf: 'center' }}
                >
                  Terapkan Preview
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Close />}
                  onClick={handleBulkCancel}
                  sx={{ fontWeight: 700, alignSelf: 'center' }}
                >
                  Batalkan
                </Button>
              )}
            </Box>
            {bulkApplied && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Preview diterapkan: {bulkQty} stok dibagi rata ke {products?.flatMap((p) => (p.variants ?? []).filter((v) => v.id != null)).length ?? 0} varian. Periksa kolom "Stok Baru", lalu klik "Simpan" per baris untuk menyimpan, atau "Batalkan" untuk membersihkan semua.
              </Alert>
            )}
           </CardContent>
        </Card>
      </Collapse>

      {filledEditsCount >= 5 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Save />}
            onClick={() => saveAllMutation.mutate()}
            disabled={saveAllMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            Simpan Semua ({filledEditsCount} varian)
          </Button>
        </Box>
      )}

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
                  {allRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ product: p, variant: v, isFirstVariant }) => {
                    const edited = stockEdits[v.id!];
                    const isBulkFilled = bulkApplied && edited != null;
                    return (
                      <TableRow
                        key={v.id}
                        hover
                        sx={{
                          '&:nth-of-type(even)': { bgcolor: '#FFFAF5' },
                          ...(isBulkFilled && { bgcolor: '#FFF8E1 !important' }),
                        }}
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
                            sx={{
                              width: 90,
                              ...(isBulkFilled && { '& .MuiOutlinedInput-root': { bgcolor: '#FFF3E0' } }),
                            }}
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
                    );
                  })}
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

      {/* ─── Out-of-Stock Management Section ─── */}
      <OutOfStockSection products={products} isLoading={isLoading} />
    </Box>
  );
};

// ─── Bulk Set Out-of-Stock Section ───
interface OosSectionProps {
  products: any[] | undefined;
  isLoading: boolean;
}

const OutOfStockSection: React.FC<OosSectionProps> = ({ products, isLoading: productsLoading }) => {
  const queryClient = useQueryClient();
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());
  const [success, setSuccess] = useState(false);

  const bulkSetZeroMutation = useMutation({
    mutationFn: async (variants: Array<{ productId: number; variantId: number; currentStock: number }>) => {
      // Group by product for batch API calls
      const grouped: Record<number, Array<{ variant_id: number; stock: number; change_qty: number; reason: string }>> = {};
      for (const v of variants) {
        if (!grouped[v.productId]) grouped[v.productId] = [];
        grouped[v.productId].push({
          variant_id: v.variantId,
          stock: 0,
          change_qty: -(v.currentStock),
          reason: 'Set habis (bulk)',
        });
      }
      for (const [productId, items] of Object.entries(grouped)) {
        await productApi.updateInventory(Number(productId), items);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-inventory'] });
      setSelectedVariants(new Set());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  // All variants that still have stock > 0
  const availableVariants = products?.flatMap((p) =>
    (p.variants ?? [])
      .filter((v: any) => v.id != null && (v.stock ?? 0) > 0)
      .map((v: any) => ({ productId: p.id, productName: p.name, variantId: v.id!, variantLabel: v.label, pcs: v.pcs, stock: v.stock ?? 0 }))
  ) ?? [];

  const toggleVariant = (variantId: number) => {
    setSelectedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedVariants.size === availableVariants.length) setSelectedVariants(new Set());
    else setSelectedVariants(new Set(availableVariants.map((v) => v.variantId)));
  };

  const handleBulkSetZero = () => {
    const variants = availableVariants
      .filter((v) => selectedVariants.has(v.variantId))
      .map((v) => ({ productId: v.productId, variantId: v.variantId, currentStock: v.stock }));
    bulkSetZeroMutation.mutate(variants);
  };

  if (productsLoading) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <RemoveShoppingCart color="error" />
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>Set Produk Habis</Typography>
          <Typography variant="body2" color="text.secondary">
            Pilih varian lalu klik "Set Habis" untuk mengubah stok menjadi 0 — produk tidak bisa dipesan di PWA
          </Typography>
        </Box>
        {selectedVariants.size > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<RemoveShoppingCart />}
            onClick={handleBulkSetZero}
            disabled={bulkSetZeroMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            Set Habis ({selectedVariants.size})
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>Stok berhasil diubah menjadi 0!</Alert>}

      {availableVariants.length === 0 ? (
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          Semua varian sudah habis (stok 0).
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#FFEBEE' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedVariants.size === availableVariants.length && availableVariants.length > 0}
                    indeterminate={selectedVariants.size > 0 && selectedVariants.size < availableVariants.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Produk</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Varian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pcs</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Stok Saat Ini</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableVariants.map((v) => (
                <TableRow
                  key={v.variantId}
                  hover
                  onClick={() => toggleVariant(v.variantId)}
                  sx={{ cursor: 'pointer', ...(selectedVariants.has(v.variantId) && { bgcolor: '#FFEBEE !important' }) }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedVariants.has(v.variantId)} />
                  </TableCell>
                  <TableCell>{v.productName}</TableCell>
                  <TableCell>{v.variantLabel}</TableCell>
                  <TableCell>{v.pcs}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={v.stock}
                      size="small"
                      color={v.stock < 10 ? 'warning' : 'success'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InventoryPage;
