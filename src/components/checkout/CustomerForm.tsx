import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CustomerInfo } from '../../types';
import { storefrontApi, type PublicShippingZone } from '../../services/storefrontApi';
import { formatRupiah } from '../../utils/format';

export const SHIPPING_FEE = 10000;

export function getShippingFee(area?: string, zones?: PublicShippingZone[]): number {
  if (!area || !zones) return 0;
  const zone = zones.find((z) => z.zone_name === area);
  return zone ? Number(zone.shipping_cost) : 0;
}

const schema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    phone: z
      .string()
      .regex(/^(\+62|62|0)[0-9]{8,12}$/, 'Format nomor HP tidak valid (contoh: 08123456789)'),
    address: z.string().min(5, 'Alamat minimal 5 karakter'),
    notes: z.string().optional(),
    deliveryMethod: z.enum(['Pickup', 'Delivery']),
    deliveryArea: z.string().optional(),
    paymentMethod: z.enum(['Cash', 'Transfer', 'QRIS']),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod === 'Delivery') return !!data.deliveryArea;
      return true;
    },
    { message: 'Pilih area pengiriman', path: ['deliveryArea'] }
  );

type FormData = z.infer<typeof schema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerInfo) => void;
  defaultValues?: Partial<CustomerInfo>;
  onShippingZonesLoaded?: (zones: PublicShippingZone[]) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, defaultValues, onShippingZonesLoaded }) => {
  const [shippingZones, setShippingZones] = useState<PublicShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    storefrontApi.getShippingZones()
      .then((res) => {
        setShippingZones(res.data);
        onShippingZonesLoaded?.(res.data);
      })
      .catch(() => {})
      .finally(() => setZonesLoading(false));
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      phone: defaultValues?.phone || '',
      address: defaultValues?.address || '',
      notes: defaultValues?.notes || '',
      deliveryMethod: defaultValues?.deliveryMethod || 'Delivery',
      deliveryArea: defaultValues?.deliveryArea || '',
      paymentMethod: defaultValues?.paymentMethod || 'Cash',
    },
  });

  const deliveryMethod = watch('deliveryMethod');

  return (
    <Box
      component="form"
      id="customer-form"
      onSubmit={handleSubmit((data) => onSubmit(data))}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nama Lengkap"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            required
            slotProps={{ htmlInput: { 'aria-label': 'Nama lengkap' } }}
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nomor HP"
            error={!!errors.phone}
            helperText={errors.phone?.message || 'Contoh: 08123456789'}
            fullWidth
            required
            type="tel"
            slotProps={{ htmlInput: { 'aria-label': 'Nomor HP' } }}
          />
        )}
      />

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Alamat"
            error={!!errors.address}
            helperText={errors.address?.message}
            fullWidth
            required
            multiline
            rows={3}
            slotProps={{ htmlInput: { 'aria-label': 'Alamat' } }}
          />
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Catatan (opsional)"
            fullWidth
            multiline
            rows={2}
            placeholder="Contoh: tidak pedas, saus terpisah..."
            slotProps={{ htmlInput: { 'aria-label': 'Catatan pesanan' } }}
          />
        )}
      />

      <Box>
        <FormControl component="fieldset" required>
          <FormLabel component="legend">
            <Typography variant="subtitle2" fontWeight={600}>
              Metode Pengiriman
            </Typography>
          </FormLabel>
          <Controller
            name="deliveryMethod"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} row>
                <FormControlLabel
                  value="Pickup"
                  control={<Radio />}
                  label="Ambil Sendiri (Pickup)"
                />
                <FormControlLabel value="Delivery" control={<Radio />} label="Diantar (Delivery)" />
              </RadioGroup>
            )}
          />
        </FormControl>
      </Box>

      {deliveryMethod === 'Pickup' && (
        <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
          Ambil pesanan di lokasi kami.{' '}
          <a
            href="https://maps.app.goo.gl/JCBAmN6bCf1nxqZE9"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lihat lokasi di Google Maps
          </a>
        </Alert>
      )}

      {deliveryMethod === 'Delivery' && (        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
            Pengiriman tersedia untuk area yang terdaftar. Biaya kirim sesuai zona pengiriman.
          </Alert>
          {zonesLoading ? <CircularProgress size={24} /> : (
            <Controller
              name="deliveryArea"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.deliveryArea}>
                  <InputLabel id="delivery-area-label">Area Pengiriman</InputLabel>
                  <Select
                    {...field}
                    labelId="delivery-area-label"
                    label="Area Pengiriman"
                    inputProps={{ 'aria-label': 'Area pengiriman' }}
                  >
                    {shippingZones.map((zone) => (
                      <MenuItem key={zone.id} value={zone.zone_name}>
                        {zone.zone_name} — {Number(zone.shipping_cost) === 0 ? 'Gratis' : formatRupiah(Number(zone.shipping_cost))}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.deliveryArea && (
                    <FormHelperText>{errors.deliveryArea.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          )}
        </Box>
      )}

      <Box>
        <FormControl component="fieldset" required>
          <FormLabel component="legend">
            <Typography variant="subtitle2" fontWeight={600}>
              Metode Pembayaran
            </Typography>
          </FormLabel>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} row>
                <FormControlLabel value="Cash" control={<Radio />} label="Tunai (Cash)" />
                <FormControlLabel value="Transfer" control={<Radio />} label="Transfer Bank" />
                <FormControlLabel value="QRIS" control={<Radio />} label="QRIS" />
              </RadioGroup>
            )}
          />
        </FormControl>
      </Box>
    </Box>
  );
};

export default CustomerForm;
