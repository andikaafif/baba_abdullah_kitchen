import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import type { CartItem, CustomerInfo } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/format';

interface ReceiptTemplateProps {
  items: CartItem[];
  customerInfo: CustomerInfo;
  orderNumber: string;
  totalPrice: number;
  orderDate: Date;
}

const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ items, customerInfo, orderNumber, totalPrice, orderDate }, ref) => {
    return (
      <Box
        ref={ref}
        id="receipt-template"
        sx={{
          width: 400,
          bgcolor: '#FFFFFF',
          p: 3,
          fontFamily: '"Poppins", sans-serif',
          color: '#000',
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: '#8B4513', color: '#fff', p: 2, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Dapoer Baba Abdullah
          </Typography>
          <Typography variant="caption">🥟 Dim Sum Homemade Premium</Typography>
        </Box>

        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="body2">
            <strong>No. Order:</strong> {orderNumber}
          </Typography>
          <Typography variant="body2">
            <strong>Tanggal:</strong> {formatDateTime(orderDate)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: '#8B4513' }} />

        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
          Informasi Pelanggan
        </Typography>
        <Typography variant="body2">Nama: {customerInfo.name}</Typography>
        <Typography variant="body2">No. HP: {customerInfo.phone}</Typography>
        <Typography variant="body2">Alamat: {customerInfo.address}</Typography>
        <Typography variant="body2">Pengiriman: {customerInfo.deliveryMethod}</Typography>
        <Typography variant="body2">Pembayaran: {customerInfo.paymentMethod}</Typography>
        {customerInfo.notes && (
          <Typography variant="body2">Catatan: {customerInfo.notes}</Typography>
        )}

        <Divider sx={{ my: 1.5, borderColor: '#8B4513' }} />

        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Item Pesanan
        </Typography>

        {items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {item.name} ({item.variant.label})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.variant.pcs} × {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {formatRupiah(item.variant.price * item.quantity)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5, borderColor: '#8B4513' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            TOTAL
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            {formatRupiah(totalPrice)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', pt: 1, borderTop: '1px solid #8B4513' }}>
          <Typography variant="caption" color="text.secondary">
            Terima kasih telah memesan di Dapoer Baba Abdullah!
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Semoga selalu sehat dan barokah. 🙏
          </Typography>
        </Box>
      </Box>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default ReceiptTemplate;
