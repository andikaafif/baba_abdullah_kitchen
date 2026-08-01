import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CustomerInfo } from '../../types';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,12}$/, 'Format nomor HP tidak valid (contoh: 08123456789)'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  notes: z.string().optional(),
  deliveryMethod: z.enum(['Pickup', 'Delivery']),
  paymentMethod: z.enum(['Cash', 'Transfer', 'QRIS']),
});

type FormData = z.infer<typeof schema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerInfo) => void;
  defaultValues?: Partial<CustomerInfo>;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, defaultValues }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      phone: defaultValues?.phone || '',
      address: defaultValues?.address || '',
      notes: defaultValues?.notes || '',
      deliveryMethod: defaultValues?.deliveryMethod || 'Delivery',
      paymentMethod: defaultValues?.paymentMethod || 'Cash',
    },
  });

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
