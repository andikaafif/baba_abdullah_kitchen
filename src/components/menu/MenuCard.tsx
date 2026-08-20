import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { MenuItem, MenuVariant } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatRupiah } from '../../utils/format';

interface MenuCardProps {
  item: MenuItem;
  storeClosed?: boolean;
}

const categoryColors: Record<string, string> = {
  Kukus: '#4CAF50',
  Mentai: '#FF9800',
  Cheese: '#F6C453',
  Frozen: '#2196F3',
};

const MenuCard: React.FC<MenuCardProps> = ({ item, storeClosed }) => {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant>(
    item.variants.find((v) => (v.stock ?? 0) > 0) ?? item.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isOutOfStock = (selectedVariant.stock ?? 0) <= 0;
  const isDisabled = isOutOfStock || !!storeClosed;
  const hasAnyPromo = item.variants.some((v) => !!v.promoName);

  const handleAddToCart = () => {
    addItem(item, selectedVariant, quantity);
    setSnackbarOpen(true);
    setQuantity(1);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover .menu-card-image': {
            transform: 'scale(1.06)',
          },
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="200"
            image={item.image}
            alt={item.name}
            className="menu-card-image"
            sx={{ objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)' }}
            loading="lazy"
          />
          <Chip
            label={item.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: categoryColors[item.category] || '#8B4513',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
          {hasAnyPromo && (
            <Chip
              icon={<LocalOfferIcon />}
              label="Promo"
              size="small"
              color="error"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {item.description}
          </Typography>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, flexDirection: 'column', gap: 1 }}>
          <FormControl fullWidth size="small" sx={{ mb: 0.5 }}>
            <InputLabel id={`variant-label-${item.id}`}>Pilih Varian</InputLabel>
            <Select
              labelId={`variant-label-${item.id}`}
              value={selectedVariant.label}
              label="Pilih Varian"
              onChange={(e) => {
                const v = item.variants.find((variant) => variant.label === e.target.value);
                if (v) setSelectedVariant(v);
              }}
              aria-label={`Pilih varian ${item.name}`}
            >
              {item.variants.map((v) => (
                <MuiMenuItem key={v.label} value={v.label} disabled={(v.stock ?? 0) <= 0}>
                  {v.label} ({v.pcs}) — {formatRupiah(v.price)}
                  {v.originalPrice && v.originalPrice !== v.price && (
                    <>&nbsp;<s style={{ opacity: 0.5, fontSize: '0.85em' }}>{formatRupiah(v.originalPrice)}</s></>
                  )}
                  {(v.stock ?? 0) <= 0 ? ' (Habis)' : ''}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', width: '100%', mb: 0.5 }}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {formatRupiah(selectedVariant.price)}
            </Typography>
            {selectedVariant.originalPrice && selectedVariant.originalPrice !== selectedVariant.price && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through', opacity: 0.6 }}
              >
                {formatRupiah(selectedVariant.originalPrice)}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Kurangi jumlah"
            >
              <RemoveIcon />
            </IconButton>
            <Typography fontWeight={600} minWidth={32} textAlign="center">
              {quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Tambah jumlah"
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={isDisabled}
            aria-label={`Tambah ${item.name} ke keranjang`}
          >
            {storeClosed ? 'Toko Tutup' : isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </Button>

          {isOutOfStock && (selectedVariant.oosMessage || selectedVariant.restockAt) && (
            <Box sx={{ width: '100%', mt: 0.5, textAlign: 'center' }}>
              {selectedVariant.oosMessage && (
                <Typography variant="caption" color="error" display="block">
                  {selectedVariant.oosMessage}
                </Typography>
              )}
              {selectedVariant.restockAt && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Estimasi restock: {new Date(selectedVariant.restockAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </Typography>
              )}
            </Box>
          )}
        </CardActions>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ borderRadius: 3 }}>
          <strong>{item.name}</strong> berhasil ditambahkan ke keranjang!
        </Alert>
      </Snackbar>
    </>
  );
};

export default MenuCard;
