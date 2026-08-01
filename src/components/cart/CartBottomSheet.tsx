import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Drawer,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { formatRupiah } from '../../utils/format';

const CartBottomSheet: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, totalPrice } = useCartStore();
  const { cartSheetOpen, setCartSheetOpen } = useUIStore();

  const handleCheckout = () => {
    setCartSheetOpen(false);
    navigate('/checkout');
  };

  return (
    <Drawer
      anchor="bottom"
      open={cartSheetOpen}
      onClose={() => setCartSheetOpen(false)}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85vh',
          },
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: 'divider',
          }}
        />
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Keranjang Belanja
        </Typography>
      </Box>

      <Box sx={{ px: 3, overflowY: 'auto', flexGrow: 1, maxHeight: 'calc(85vh - 200px)' }}>
        {items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 6,
              gap: 2,
            }}
          >
            <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography color="text.secondary">Keranjang kamu masih kosong</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Yuk, pilih menu favoritmu!
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
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
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => removeItem(item.id)}
                    color="error"
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
          ))
        )}
      </Box>

      {items.length > 0 && (
        <Box sx={{ px: 3, pt: 2, pb: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              {formatRupiah(totalPrice())}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setCartSheetOpen(false)}
              aria-label="Lanjut belanja"
            >
              Lanjut Belanja
            </Button>
            <Button variant="contained" fullWidth onClick={handleCheckout} aria-label="Checkout">
              Checkout
            </Button>
          </Box>
        </Box>
      )}

      {items.length === 0 && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setCartSheetOpen(false)}
            aria-label="Kembali ke menu"
          >
            Kembali ke Menu
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartBottomSheet;
