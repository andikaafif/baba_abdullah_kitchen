import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import CustomerForm from '../../components/checkout/CustomerForm';
import { getShippingFee } from '../../components/checkout/CustomerForm';
import type { CustomerInfo } from '../../types';
import { formatRupiah } from '../../utils/format';
import type { PublicShippingZone } from '../../services/storefrontApi';

const steps = ['Informasi Pelanggan', 'Ringkasan Pesanan'];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice } = useCartStore();
  const [activeStep, setActiveStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [shippingZones, setShippingZones] = useState<PublicShippingZone[]>([]);

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Keranjang Kosong
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Tambahkan item ke keranjang terlebih dahulu
        </Typography>
        <Button variant="contained" onClick={() => navigate('/menu')}>
          Ke Menu
        </Button>
      </Container>
    );
  }

  const handleCustomerFormSubmit = (data: CustomerInfo) => {
    setCustomerInfo(data);
    setActiveStep(1);
  };

  const handlePlaceOrder = () => {
    if (!customerInfo) return;
    const shippingFee = getShippingFee(customerInfo.deliveryArea, shippingZones);
    navigate('/confirmation', { state: { customerInfo, items, totalPrice: totalPrice(), shippingFee } });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
        aria-label="Kembali"
      >
        Kembali
      </Button>

      <Typography variant="h5" fontWeight={700} mb={3}>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Informasi Pelanggan
          </Typography>
          <CustomerForm
            onSubmit={handleCustomerFormSubmit}
            defaultValues={customerInfo || undefined}
            onShippingZonesLoaded={setShippingZones}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              type="submit"
              form="customer-form"
              size="large"
              aria-label="Lanjut ke ringkasan pesanan"
            >
              Lanjutkan →
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 1 && customerInfo && (
        <Box>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Ringkasan Pesanan
            </Typography>
            {items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Avatar
                  src={item.image}
                  variant="rounded"
                  sx={{ width: 48, height: 48, borderRadius: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Chip
                    label={`${item.variant.label} (${item.variant.pcs})`}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    x{item.quantity}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary">
                    {formatRupiah(item.variant.price * item.quantity)}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">{formatRupiah(totalPrice())}</Typography>
            </Box>
            {getShippingFee(customerInfo.deliveryArea, shippingZones) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Ongkos Kirim</Typography>
                <Typography variant="body2" color="text.secondary">{formatRupiah(getShippingFee(customerInfo.deliveryArea, shippingZones))}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>
                Total Bayar
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatRupiah(totalPrice() + getShippingFee(customerInfo.deliveryArea, shippingZones))}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Informasi Pelanggan
            </Typography>
            <Typography variant="body2">
              <strong>Nama:</strong> {customerInfo.name}
            </Typography>
            <Typography variant="body2">
              <strong>No. HP:</strong> {customerInfo.phone}
            </Typography>
            <Typography variant="body2">
              <strong>Alamat:</strong> {customerInfo.address}
            </Typography>
            <Typography variant="body2">
              <strong>Pengiriman:</strong> {customerInfo.deliveryMethod}
            </Typography>
            {customerInfo.deliveryMethod === 'Delivery' && customerInfo.deliveryArea && (
              <Typography variant="body2">
                <strong>Area Pengiriman:</strong> {customerInfo.deliveryArea}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Pembayaran:</strong> {customerInfo.paymentMethod}
            </Typography>
            {customerInfo.notes && (
              <Typography variant="body2">
                <strong>Catatan:</strong> {customerInfo.notes}
              </Typography>
            )}
          </Paper>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Setelah memesan, struk akan diunduh otomatis dan WhatsApp akan terbuka.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(0)}
              aria-label="Kembali ke informasi pelanggan"
            >
              Edit Info
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePlaceOrder}
              aria-label="Buat pesanan"
            >
              🥟 Buat Pesanan
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default CheckoutPage;
