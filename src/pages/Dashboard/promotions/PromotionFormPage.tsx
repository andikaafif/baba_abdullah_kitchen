import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, TextField, Grid,
  ToggleButton, ToggleButtonGroup, Switch, FormControlLabel,
  IconButton, Alert, CircularProgress, Checkbox, FormGroup,
  FormLabel, FormControl, Accordion, AccordionSummary, AccordionDetails,
  Chip,
} from '@mui/material';
import { ArrowBack, ExpandMore } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionApi, type PromotionPayload } from '../../../services/promotionApi';
import { productApi } from '../../../services/productApi';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n));

const PromotionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState('');

  const { data: allProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.list().then((r) => r.data),
  });

  const { data: promo, isLoading: loadingPromo } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => promotionApi.get(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (promo) {
      setName(promo.name);
      setDescription(promo.description ?? '');
      setDiscountType(promo.discount_type);
      setDiscountValue(String(promo.discount_value));
      setStartDate(promo.start_date);
      setEndDate(promo.end_date);
      setIsActive(!!promo.is_active);
      setSelectedProductIds(promo.products?.map((p) => p.id) ?? []);
      setSelectedVariantIds(promo.variants?.map((v) => v.id) ?? []);
    }
  }, [promo]);

  const mutation = useMutation({
    mutationFn: (data: PromotionPayload) =>
      isEdit ? promotionApi.update(Number(id), data) : promotionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      navigate('/dashboard/promotions');
    },
    onError: () => setSubmitError('Gagal menyimpan promosi.'),
  });

  const toggleProduct = (pid: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  };

  const toggleVariant = (vid: number) => {
    setSelectedVariantIds((prev) =>
      prev.includes(vid) ? prev.filter((v) => v !== vid) : [...prev, vid]
    );
  };

  const toggleAllVariantsOfProduct = (productId: number, variantIds: number[]) => {
    const allSelected = variantIds.every((vid) => selectedVariantIds.includes(vid));
    if (allSelected) {
      setSelectedVariantIds((prev) => prev.filter((v) => !variantIds.includes(v)));
    } else {
      setSelectedVariantIds((prev) => [...new Set([...prev, ...variantIds])]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    mutation.mutate({
      name,
      description,
      discount_type: discountType,
      discount_value: Number(discountValue),
      start_date: startDate,
      end_date: endDate,
      is_active: isActive ? 1 : 0,
      product_ids: selectedProductIds,
      variant_ids: selectedVariantIds,
    });
  };

  if (isEdit && loadingPromo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard/promotions')}><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isEdit ? 'Edit Promosi' : 'Buat Promosi Baru'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Promosi berbasis event untuk produk atau varian tertentu
          </Typography>
        </Box>
      </Box>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Row 1: Detail Promosi — full width */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>Detail Promosi</Typography>

            <TextField
              label="Nama Promo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="e.g. Promo Lebaran 2026"
            />
            <TextField
              label="Deskripsi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>Tipe Diskon</Typography>
              <ToggleButtonGroup
                value={discountType}
                exclusive
                onChange={(_e, v) => v && setDiscountType(v)}
                size="small"
              >
                <ToggleButton value="percent">Persentase (%)</ToggleButton>
                <ToggleButton value="fixed">Nominal (Rp)</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              label={discountType === 'percent' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, max: discountType === 'percent' ? 100 : undefined }}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Tanggal Mulai"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Tanggal Selesai"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
              label="Aktifkan Promo"
            />
          </CardContent>
        </Card>

        {/* Row 2: Product selector & Variant selector side by side */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Product selector — applies to all variants of a product */}
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                    Berlaku untuk Semua Varian Produk
                  </FormLabel>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Centang produk untuk menerapkan diskon ke semua varian produk tersebut
                  </Typography>
                  <FormGroup>
                    {allProducts?.map((p) => (
                      <FormControlLabel
                        key={p.id}
                        control={
                          <Checkbox
                            checked={selectedProductIds.includes(p.id)}
                            onChange={() => toggleProduct(p.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{p.category_name}</Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {/* Variant-level selector */}
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Berlaku untuk Varian Tertentu
                </FormLabel>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  Pilih varian spesifik yang mendapat diskon (selain produk yang sudah dicentang di atas)
                </Typography>
                {allProducts?.map((product) => {
                  const variantIds = product.variants.map((v) => v.id!).filter(Boolean);
                  const selectedCount = variantIds.filter((vid) => selectedVariantIds.includes(vid)).length;
                  return (
                    <Accordion
                      key={product.id}
                      disableGutters
                      elevation={0}
                      sx={{ border: '1px solid', borderColor: 'divider', mb: 1, '&::before': { display: 'none' } }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 48 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{product.name}</Typography>
                          {selectedCount > 0 && (
                            <Chip label={`${selectedCount} varian`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        {variantIds.length > 1 && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={variantIds.every((vid) => selectedVariantIds.includes(vid))}
                                indeterminate={selectedCount > 0 && selectedCount < variantIds.length}
                                onChange={() => toggleAllVariantsOfProduct(product.id, variantIds)}
                                size="small"
                              />
                            }
                            label={<Typography variant="caption" fontWeight={600}>Pilih Semua Varian</Typography>}
                          />
                        )}
                        <FormGroup sx={{ pl: 1 }}>
                          {product.variants.map((v) => (
                            <FormControlLabel
                              key={v.id}
                              control={
                                <Checkbox
                                  checked={selectedVariantIds.includes(v.id!)}
                                  onChange={() => toggleVariant(v.id!)}
                                  size="small"
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {v.label} ({v.pcs}) — {formatRp(v.price)}
                                </Typography>
                              }
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/dashboard/promotions')} sx={{ minWidth: 120 }}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={mutation.isPending}
            sx={{ fontWeight: 700, minWidth: 180 }}
          >
            {mutation.isPending
              ? <CircularProgress size={24} color="inherit" />
              : isEdit ? 'Simpan Perubahan' : 'Buat Promosi'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PromotionFormPage;
