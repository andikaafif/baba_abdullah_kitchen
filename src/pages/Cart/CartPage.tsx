import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Divider,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatRupiah } from '../../utils/format';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCartOutlinedIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Keranjang Kosong
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Yuk, pilih menu favoritmu!
        </Typography>
        <Button variant="contained" onClick={() => navigate('/menu')} aria-label="Ke menu">
          Ke Menu
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Keranjang Belanja
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {items.map((item) => (
          <Box key={item.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={item.image}
                variant="rounded"
                sx={{ width: 56, height: 56, borderRadius: 2 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {item.name}
                </Typography>
                <Chip
                  label={`${item.variant.label} (${item.variant.pcs})`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.7rem', mt: 0.25 }}
                />
                <Typography variant="body2" color="primary" fontWeight={600} mt={0.5}>
                  {formatRupiah(item.variant.price * item.quantity)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Hapus ${item.name} dari keranjang`}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    aria-label="Kurangi jumlah"
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    sx={{ px: 1.5, minWidth: 28, textAlign: 'center' }}
                    variant="body2"
                    fontWeight={600}
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    aria-label="Tambah jumlah"
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Total
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            {formatRupiah(totalPrice())}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" fullWidth onClick={() => navigate('/menu')}>
          Lanjut Belanja
        </Button>
        <Button variant="contained" fullWidth onClick={() => navigate('/checkout')}>
          Checkout
        </Button>
      </Box>
    </Container>
  );
};

export default CartPage;
