import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useNavigate, useLocation } from 'react-router-dom';
import type { CartItem, CustomerInfo } from '../../types';
import { generateOrderNumber, formatRupiah } from '../../utils/format';
import { generatePDF, generatePNG } from '../../services/receiptService';
import { buildWhatsAppMessage, openWhatsApp } from '../../utils/whatsapp';
import ReceiptTemplate from '../../components/receipt/ReceiptTemplate';
import { useCartStore } from '../../store/cartStore';
import { getShippingFee } from '../../components/checkout/CustomerForm';

interface LocationState {
  customerInfo: CustomerInfo;
  items: CartItem[];
  totalPrice: number;
  shippingFee: number;
}

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clearCart = useCartStore((s) => s.clearCart);
  const [orderNumber] = useState(() => generateOrderNumber());
  const [orderDate] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { customerInfo, items, totalPrice, shippingFee: stateFee } = state;
  const shippingFee = stateFee ?? getShippingFee(customerInfo.deliveryArea);
  const grandTotal = totalPrice + shippingFee;

  const handleDownloadAndWhatsApp = async () => {
    setLoading(true);
    try {
      await generatePDF(items, customerInfo, orderNumber, totalPrice, shippingFee, orderDate);
      await new Promise((r) => setTimeout(r, 500));
      await generatePNG('receipt-template');
      await new Promise((r) => setTimeout(r, 500));
      const message = buildWhatsAppMessage(items, customerInfo, orderNumber, totalPrice, shippingFee);
      openWhatsApp(message);
      clearCart();
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
        <Typography variant="h4" fontWeight={700}>
          Pesanan Berhasil! 🎉
        </Typography>
        <Typography color="text.secondary">
          No. Order: <strong>{orderNumber}</strong>
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Struk akan diunduh otomatis, lalu WhatsApp akan terbuka untuk konfirmasi pesanan.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, textAlign: 'left' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Ringkasan Pesanan
        </Typography>
        {items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {item.name} ({item.variant.label}) ×{item.quantity}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatRupiah(item.variant.price * item.quantity)}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">{formatRupiah(totalPrice)}</Typography>
        </Box>
        {shippingFee > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Ongkos Kirim
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatRupiah(shippingFee)}
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography fontWeight={700}>Total Bayar</Typography>
          <Typography fontWeight={700} color="primary">
            {formatRupiah(grandTotal)}
          </Typography>
        </Box>
      </Paper>

      {done ? (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Struk berhasil diunduh! WhatsApp sudah terbuka. Terima kasih! 🙏
        </Alert>
      ) : (
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsAppIcon />}
          disabled={loading}
          onClick={handleDownloadAndWhatsApp}
          aria-label="Unduh struk dan lanjutkan pesanan via WhatsApp"
          // aria-label="Unduh struk dan kirim via WhatsApp"
          sx={{ mb: 2, bgcolor: '#25D366', '&:hover': { bgcolor: '#1EBE59' } }}
        >
          {loading ? 'Memproses...' : '📥 Unduh Struk & Kirim WhatsApp'}
        </Button>
      )}

      <Button
        variant="outlined"
        fullWidth
        size="large"
        onClick={() => navigate('/')}
        aria-label="Kembali ke beranda"
      >
        Kembali ke Beranda
      </Button>

      {/* Hidden receipt template for PNG export */}
      <Box
        aria-hidden
        sx={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none', zIndex: -1 }}
      >
        <ReceiptTemplate
          ref={receiptRef}
          items={items}
          customerInfo={customerInfo}
          orderNumber={orderNumber}
          totalPrice={totalPrice}
          shippingFee={shippingFee}
          orderDate={orderDate}
        />
      </Box>
    </Container>
  );
};

export default ConfirmationPage;
