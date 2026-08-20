import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import type { MenuItem } from '../../types';
import MenuCard from '../../components/menu/MenuCard';
import MenuCardSkeleton from '../../components/menu/MenuCardSkeleton';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { storefrontApi, type PublicProduct, type PublicPromotion, API_BASE } from '../../services/storefrontApi';

function applyPromotions(items: MenuItem[], promos: PublicPromotion[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    variants: item.variants.map((v) => {
      const promo = promos.find(
        (p) => p.product_ids.includes(Number(item.id)) || (v.id && p.variant_ids.includes(v.id))
      );
      if (!promo) return v;
      const discounted =
        promo.discount_type === 'percent'
          ? v.price - v.price * (Number(promo.discount_value) / 100)
          : v.price - Number(promo.discount_value);
      const finalPrice = Math.max(0, Math.round(discounted));
      return { ...v, originalPrice: v.price, price: finalPrice, promoName: promo.name };
    }),
  }));
}

function mapProductToMenuItem(p: PublicProduct): MenuItem {
  const resolveImage = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  return {
    id: String(p.id),
    name: p.name,
    category: (p.category_name as MenuItem['category']) || 'Kukus',
    description: p.description || '',
    variants: p.variants.map((v) => ({ id: v.id, label: v.label, pcs: v.pcs, price: Number(v.price), stock: v.stock ?? 0 })),
    image: resolveImage(p.photo_url),
  };
}

const MenuPage: React.FC = () => {
  const cartTotal = useCartStore((s) => s.totalItems());
  const setCartSheetOpen = useUIStore((s) => s.setCartSheetOpen);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [storeClosed, setStoreClosed] = useState<{ enabled: boolean; message: string; reopen_at: string | null } | null>(null);

  useEffect(() => {
    const loadProducts = Promise.all([
      storefrontApi.getProducts(),
      storefrontApi.getCategories(),
      storefrontApi.getActivePromotions(),
    ]);
    const loadClosure = storefrontApi.getStoreClosure().catch(() => ({ data: { enabled: false, message: '', reopen_at: null } }));
    const loadOos = storefrontApi.getOutOfStockSettings().catch(() => ({ data: [] as Array<{ variant_id: number; product_id: number; message: string | null; restock_at: string | null }> }));

    Promise.all([loadProducts, loadClosure, loadOos]).then(([[productsRes, categoriesRes, promosRes], closureRes, oosRes]) => {
      setStoreClosed(closureRes.data);

      // Build OOS lookup by variant_id
      const oosMap = new Map<number, { message: string | null; restock_at: string | null }>();
      for (const oos of oosRes.data) {
        oosMap.set(oos.variant_id, { message: oos.message, restock_at: oos.restock_at });
      }

      const items = productsRes.data.map(mapProductToMenuItem);
      // Apply OOS messages to variants
      const itemsWithOos = items.map((item) => ({
        ...item,
        variants: item.variants.map((v) => {
          const oos = v.id ? oosMap.get(v.id) : undefined;
          if (!oos) return v;
          return { ...v, oosMessage: oos.message ?? undefined, restockAt: oos.restock_at ?? undefined };
        }),
      }));
      setMenuItems(applyPromotions(itemsWithOos, promosRes.data));
      const catNames = categoriesRes.data.map((c) => c.name);
      const isLainCategory = (n: string) => n === 'Lain - Lain' || n === 'Lain Lain';
      const sorted = catNames.filter((n) => !isLainCategory(n));
      const lain = catNames.find(isLainCategory);
      if (lain) sorted.push(lain);
      setCategories(['All', ...sorted]);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const aIsLain = (a.category === 'Lain - Lain' || a.category === 'Lain Lain') ? 1 : 0;
    const bIsLain = (b.category === 'Lain - Lain' || b.category === 'Lain Lain') ? 1 : 0;
    return aIsLain - bIsLain;
  });

  return (
    <Box sx={{ pb: 10 }}>
      {/* Page Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #A0522D 0%, #C4784A 100%)',
          color: 'white',
          py: 5,
          px: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 32,
            background: (theme) => `linear-gradient(transparent, ${theme.palette.background.default})`,
          },
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ animation: 'fadeInUp 0.5s ease both' }}>
          Menu Kami
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.88, mt: 0.5, animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          Pilih dim sum favoritmu 🥟
        </Typography>
      </Box>

      {/* Store Closure Dialog */}
      <Dialog
        open={storeClosed?.enabled ?? false}
        PaperProps={{ sx: { borderRadius: 4, p: 1, textAlign: 'center', maxWidth: 400 } }}
      >
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pb: 0 }}>
          <StorefrontIcon sx={{ fontSize: 48, color: 'warning.main' }} />
          <Typography variant="h6" fontWeight={700}>Toko Sedang Tutup</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {storeClosed?.message || 'Toko sedang tutup sementara'}
          </Typography>
          {storeClosed?.reopen_at && (
            <Typography variant="body2" color="text.secondary">
              Buka kembali: {new Date(storeClosed.reopen_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="outlined" href="/">Kembali ke Beranda</Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              background: (theme) => alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
            },
          }}
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
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              aria-label={`Filter kategori ${cat}`}
              sx={{
                fontWeight: 600,
                transition: 'all 0.25s ease',
                ...(activeCategory === cat && {
                  boxShadow: '0 2px 8px rgba(160,82,45,0.25)',
                }),
              }}
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
                <MenuCard item={item} storeClosed={storeClosed?.enabled} />
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
          bottom: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 24 },
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
