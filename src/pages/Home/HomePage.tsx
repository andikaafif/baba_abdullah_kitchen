import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import StarIcon from '@mui/icons-material/Star';
import GrainIcon from '@mui/icons-material/Grain';
import MenuCard from '../../components/menu/MenuCard';
import { storefrontApi, type PublicProduct, type PublicPromotion } from '../../services/storefrontApi';
import type { MenuItem } from '../../types';
import { API_BASE } from '../../services/storefrontApi';

const benefits = [
  {
    icon: <RestaurantIcon />,
    title: 'Fresh Every Day',
    desc: 'Dibuat segar setiap hari, tidak ada stok lama',
  },
  {
    icon: <FavoriteIcon />,
    title: '100% Homemade',
    desc: 'Dimasak dengan cinta di dapur rumahan kami',
  },
  {
    icon: <CheckCircleOutlineIcon />,
    title: 'No MSG',
    desc: 'Tanpa MSG, aman untuk seluruh keluarga',
  },
  { icon: <ChildCareIcon />, title: 'Kids Friendly', desc: 'Cocok untuk si kecil, lembut dan bergizi' },
  {
    icon: <StarIcon />,
    title: 'Made With Love',
    desc: 'Setiap gigitan penuh kasih sayang dan keikhlasan',
  },
  {
    icon: <GrainIcon />,
    title: 'Low Gluten',
    desc: 'Rendah gluten, lebih mudah dicerna dan ramah lambung',
  },
];

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

function applyPromotions(items: MenuItem[], promos: PublicPromotion[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    variants: item.variants.map((v) => {
      // Find promo that applies: product-level or variant-level
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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeClosed, setStoreClosed] = useState(false);

  useEffect(() => {
    const loadProducts = Promise.all([
      storefrontApi.getProducts(),
      storefrontApi.getActivePromotions(),
    ]);
    const loadClosure = storefrontApi.getStoreClosure().catch(() => ({ data: { enabled: false, message: '', reopen_at: null } }));
    const loadOos = storefrontApi.getOutOfStockSettings().catch(() => ({ data: [] as Array<{ variant_id: number; product_id: number; message: string | null; restock_at: string | null }> }));

    Promise.all([loadProducts, loadClosure, loadOos])
      .then(([[res, promosRes], closureRes, oosRes]) => {
        setStoreClosed(closureRes.data.enabled);

        const oosMap = new Map<number, { message: string | null; restock_at: string | null }>();
        for (const oos of oosRes.data) {
          oosMap.set(oos.variant_id, { message: oos.message, restock_at: oos.restock_at });
        }

        const isLain = (name: string) => name === 'Lain - Lain' || name === 'Lain Lain';
        const products = res.data
          .filter((p) => !isLain(p.category_name))
          .slice(0, 4);
        const items = products.map(mapProductToMenuItem);
        const itemsWithOos = items.map((item) => ({
          ...item,
          variants: item.variants.map((v) => {
            const oos = v.id ? oosMap.get(v.id) : undefined;
            if (!oos) return v;
            return { ...v, oosMessage: oos.message ?? undefined, restockAt: oos.restock_at ?? undefined };
          }),
        }));
        setFeaturedItems(applyPromotions(itemsWithOos, promosRes.data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #A0522D 0%, #C4784A 40%, #E8B88A 100%)',
          color: 'white',
          py: { xs: 10, md: 14 },
          px: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(246,196,83,0.3) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -100,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite 1s',
          },
        }}
      >
        {/* Floating food emojis */}
        {['🥟', '🍜', '🥢', '🫕'].map((emoji, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              fontSize: { xs: '2rem', md: '2.5rem' },
              opacity: 0.15,
              animation: `float ${5 + i}s ease-in-out infinite ${i * 0.7}s`,
              top: `${15 + i * 20}%`,
              left: i % 2 === 0 ? `${5 + i * 3}%` : 'auto',
              right: i % 2 !== 0 ? `${5 + i * 3}%` : 'auto',
              pointerEvents: 'none',
            }}
          >
            {emoji}
          </Box>
        ))}
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.2rem', md: '3.2rem' },
              fontWeight: 700,
              mb: 1.5,
              textShadow: '0 2px 16px rgba(0,0,0,0.15)',
              animation: 'fadeInUp 0.7s ease both',
            }}
          >
            🥟 Dapoer Baba Abdullah
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              opacity: 0.92,
              fontWeight: 400,
              fontSize: { xs: '1.05rem', md: '1.35rem' },
              animation: 'fadeInUp 0.7s ease 0.15s both',
            }}
          >
            Dim Sum Homemade Premium
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4.5,
              opacity: 0.88,
              maxWidth: 520,
              mx: 'auto',
              lineHeight: 1.8,
              animation: 'fadeInUp 0.7s ease 0.3s both',
            }}
          >
            Nikmati cita rasa dim sum autentik yang dibuat dengan bahan pilihan, tanpa MSG, segar
            setiap hari. Cocok untuk keluarga dan si kecil.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menu')}
            aria-label="Pesan sekarang"
            sx={{
              bgcolor: '#F6C453',
              color: '#5C2E00',
              fontWeight: 700,
              fontSize: '1.05rem',
              px: 5,
              py: 1.8,
              borderRadius: 3,
              animation: 'fadeInUp 0.7s ease 0.45s both',
              boxShadow: '0 4px 20px rgba(246,196,83,0.4)',
              '&:hover': {
                bgcolor: '#E5B342',
                boxShadow: '0 6px 28px rgba(246,196,83,0.5)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            🛒 Pesan Sekarang
          </Button>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          mb={1}
          sx={{ animation: 'fadeInUp 0.6s ease both' }}
        >
          Kenapa Pilih Kami?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={6}
          maxWidth={500}
          mx="auto"
          sx={{ animation: 'fadeInUp 0.6s ease 0.1s both' }}
        >
          Dapoer Baba Abdullah hadir dengan komitmen kualitas terbaik untuk keluarga Anda
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {benefits.map((b, idx) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={b.title}>
              <Card
                sx={{
                  textAlign: 'center',
                  height: '100%',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  cursor: 'default',
                  animation: `fadeInUp 0.5s ease ${0.08 * idx}s both`,
                  '&:hover': {
                    boxShadow: '0 8px 28px rgba(160,82,45,0.12)',
                    borderColor: 'primary.main',
                    transform: 'translateY(-6px)',
                  },
                  transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #A0522D, #C4784A)',
                      mx: 'auto',
                      mb: 1.5,
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 14px rgba(160,82,45,0.2)',
                    }}
                  >
                    {b.icon}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    {b.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {b.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Menu */}
      <Box sx={{ bgcolor: 'rgba(160,82,45,0.03)', py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            mb={1}
            sx={{ animation: 'fadeInUp 0.6s ease both' }}
          >
            Menu Andalan
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={6}
            maxWidth={500}
            mx="auto"
            sx={{ animation: 'fadeInUp 0.6s ease 0.1s both' }}
          >
            Pilihan dim sum terpopuler yang disukai pelanggan setia kami
          </Typography>
          <Grid container spacing={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : featuredItems.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
                <MenuCard item={item} storeClosed={storeClosed} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/menu')}
              aria-label="Lihat semua menu"
              sx={{ px: 5, borderRadius: 3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              Lihat Semua Menu →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #6D3418 0%, #A0522D 100%)',
          color: 'white',
          py: 5,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ animation: 'fadeIn 0.5s ease both' }}>
          🥟 Dapoer Baba Abdullah
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
          Dim Sum Homemade Premium · Segar Setiap Hari
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          WhatsApp: +62 822-6007-0364
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.6, mt: 2, display: 'block' }}>
          © 2026 Dapoer Baba Abdullah. All rights reserved. powered by <a href="https://umsoftware.id" style={{ color: 'inherit', textDecoration: 'underline' }}>UM Software</a>
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
