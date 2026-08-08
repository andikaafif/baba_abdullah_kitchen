import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Chip,
  Fab,
  Badge,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { menuItems } from '../../data/menu';
import type { MenuCategory } from '../../types';
import MenuCard from '../../components/menu/MenuCard';
import MenuCardSkeleton from '../../components/menu/MenuCardSkeleton';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';

const categories: Array<'All' | MenuCategory> = ['All', 'Kukus', 'Mentai', 'Cheese', 'Frozen', 'Birthday'];

const MenuPage: React.FC = () => {
  const cartTotal = useCartStore((s) => s.totalItems());
  const setCartSheetOpen = useUIStore((s) => s.setCartSheetOpen);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | MenuCategory>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ pb: 10 }}>
      {/* Page Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B4513 0%, #B5651D 100%)',
          color: 'white',
          py: 4,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Menu Kami
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5 }}>
          Pilih dim sum favoritmu 🥟
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Cari menu' },
          }}
        />

        {/* Category Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              aria-label={`Filter kategori ${cat}`}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        {/* Menu Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <MenuCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Menu tidak ditemukan
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Coba kata kunci lain atau pilih kategori berbeda
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <MenuCard item={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Cart FAB */}
      <Fab
        color="primary"
        aria-label={`Buka keranjang, ${cartTotal} item`}
        onClick={() => setCartSheetOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 24 },
          right: 24,
          transition: 'transform 0.2s ease',
          transform: cartTotal > 0 ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Badge badgeContent={cartTotal} color="error" max={99}>
          <ShoppingCartIcon />
        </Badge>
      </Fab>
    </Box>
  );
};

export default MenuPage;
