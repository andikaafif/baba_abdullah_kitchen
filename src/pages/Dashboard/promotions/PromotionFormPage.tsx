import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, TextField, Grid,
  ToggleButton, ToggleButtonGroup, Switch, FormControlLabel,
  IconButton, Alert, CircularProgress, Checkbox, FormGroup,
  FormLabel, FormControl,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionApi, type PromotionPayload } from '../../../services/promotionApi';
import { productApi } from '../../../services/productApi';

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
            Promosi berbasis event untuk produk pilihan
          </Typography>
        </Box>
      </Box>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
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
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {/* Product selector */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                    Pilih Produk yang Berlaku
                  </FormLabel>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                  : isEdit ? 'Simpan Perubahan' : 'Buat Promosi'}
              </Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/dashboard/promotions')}>
                Batal
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PromotionFormPage;
