import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, TextField, Grid,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  IconButton, Alert, CircularProgress, Divider, Paper,
} from '@mui/material';
import { Add, Delete, ArrowBack, CloudUpload } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, categoryApi } from '../../../services/productApi';

interface VariantRow {
  id?: number;
  label: string;
  pcs: string;
  price: number | string;
  cost_price: number | string;
  stock: number | string;
}

const emptyVariant = (): VariantRow => ({ label: '', pcs: '', price: '', cost_price: '', stock: '' });

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);
  const [submitError, setSubmitError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list().then((r) => r.data),
  });

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.get(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setCategoryId(String(product.category_id));
      setIsActive(!!product.is_active);
      setPhotoUrl(product.photo_url ?? '');
      setVariants(
        product.variants.map((v) => ({
          id: v.id,
          label: v.label,
          pcs: v.pcs,
          price: v.price,
          cost_price: v.cost_price ?? 0,
          stock: v.stock ?? 0,
        }))
      );
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: (fd: FormData) =>
      isEdit ? productApi.update(Number(id), fd) : productApi.create(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/dashboard/products');
    },
    onError: () => setSubmitError('Gagal menyimpan produk. Coba lagi.'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVariantChange = (idx: number, field: keyof VariantRow, value: string) => {
    setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('category_id', categoryId);
    fd.append('is_active', isActive ? '1' : '0');
    if (photoFile) fd.append('photo', photoFile);
    else if (photoUrl) fd.append('photo_url', photoUrl);
    fd.append('variants', JSON.stringify(variants.map((v) => ({
      id: v.id,
      label: v.label,
      pcs: v.pcs,
      price: Number(v.price),
      cost_price: Number(v.cost_price),
      stock: Number(v.stock),
    }))));
    mutation.mutate(fd);
  };

  if (isEdit && loadingProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard/products')}><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Perbarui informasi produk' : 'Isi detail produk baru'}
          </Typography>
        </Box>
      </Box>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left: basic info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h6" fontWeight={700}>Informasi Produk</Typography>
                <TextField
                  label="Nama Produk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Deskripsi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />
                <FormControl fullWidth required>
                  <InputLabel>Kategori</InputLabel>
                  <Select label="Kategori" value={categoryId} onChange={(e) => setCategoryId(e.target.value as string)}>
                    {categories?.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
                  label="Produk Aktif"
                />
              </CardContent>
            </Card>

            {/* Variants */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Varian Produk</Typography>
                  <Button size="small" startIcon={<Add />} onClick={() => setVariants((v) => [...v, emptyVariant()])}>
                    Tambah Varian
                  </Button>
                </Box>

                {variants.map((v, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Varian #{idx + 1}</Typography>
                      {variants.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}>
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Label (e.g. Small, Medium)"
                          value={v.label}
                          onChange={(e) => handleVariantChange(idx, 'label', e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Satuan (e.g. 5 pcs)"
                          value={v.pcs}
                          onChange={(e) => handleVariantChange(idx, 'pcs', e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Harga Jual (Rp)"
                          type="number"
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          fullWidth
                          required
                          size="small"
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="HPP / Modal (Rp)"
                          type="number"
                          value={v.cost_price}
                          onChange={(e) => handleVariantChange(idx, 'cost_price', e.target.value)}
                          fullWidth
                          size="small"
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Stok"
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                          fullWidth
                          size="small"
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right: photo + actions */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Foto Produk</Typography>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: '#FFF8F0',
                    mb: 2,
                  }}
                >
                  {(photoPreview || photoUrl) ? (
                    <Box
                      component="img"
                      src={photoPreview ?? photoUrl}
                      alt="Preview"
                      sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2 }}
                    />
                  ) : (
                    <Box sx={{ py: 4 }}>
                      <CloudUpload sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Upload foto produk</Typography>
                    </Box>
                  )}
                </Box>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />}>
                  Pilih Foto
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                <Divider sx={{ my: 2 }} />
                <TextField
                  label="Atau masukkan URL foto"
                  value={photoUrl}
                  onChange={(e) => { setPhotoUrl(e.target.value); setPhotoPreview(null); setPhotoFile(null); }}
                  fullWidth
                  size="small"
                  placeholder="https://..."
                />
              </CardContent>
            </Card>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={mutation.isPending}
                sx={{ fontWeight: 700 }}
              >
                {mutation.isPending
                  ? <CircularProgress size={24} color="inherit" />
                  : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
              </Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/dashboard/products')}>
                Batal
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProductFormPage;
