import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import StarIcon from '@mui/icons-material/Star';
import { menuItems, featuredMenuIds } from '../../data/menu';
import MenuCard from '../../components/menu/MenuCard';

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
];

const featuredItems = menuItems.filter((m) => featuredMenuIds.includes(m.id));

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B4513 0%, #B5651D 50%, #D4A373 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(246, 196, 83, 0.2)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 1,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            🥟 Baba Abdullah Kitchen
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 2, opacity: 0.9, fontWeight: 400, fontSize: { xs: '1rem', md: '1.3rem' } }}
          >
            Dim Sum Homemade Premium
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, opacity: 0.85, maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}
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
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#E5B342',
              },
            }}
          >
            🛒 Pesan Sekarang
          </Button>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          Kenapa Pilih Kami?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={5}
          maxWidth={500}
          mx="auto"
        >
          Baba Abdullah Kitchen hadir dengan komitmen kualitas terbaik untuk keluarga Anda
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {benefits.map((b) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={b.title}>
              <Card
                sx={{
                  textAlign: 'center',
                  height: '100%',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(139,69,19,0.12)',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 1.5,
                      width: 52,
                      height: 52,
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
      <Box sx={{ bgcolor: 'rgba(139,69,19,0.04)', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
            Menu Andalan
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={5}
            maxWidth={500}
            mx="auto"
          >
            Pilihan dim sum terpopuler yang disukai pelanggan setia kami
          </Typography>
          <Grid container spacing={3}>
            {featuredItems.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
                <MenuCard item={item} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/menu')}
              aria-label="Lihat semua menu"
              sx={{ px: 4 }}
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
          bgcolor: '#8B4513',
          color: 'white',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          🥟 Baba Abdullah Kitchen
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          Dim Sum Homemade Premium · Segar Setiap Hari
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          WhatsApp: +62 822-6007-0364
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.6, mt: 2, display: 'block' }}>
          © 2026 Baba Abdullah Kitchen. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
