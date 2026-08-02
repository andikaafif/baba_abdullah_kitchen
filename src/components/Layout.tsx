import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
  Button,
  Paper,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import CartBottomSheet from './cart/CartBottomSheet';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Menu', path: '/menu', icon: <RestaurantMenuIcon /> },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const cartTotal = useCartStore((s) => s.totalItems());
  const { darkMode, highContrast, toggleDarkMode, toggleHighContrast, setCartSheetOpen } =
    useUIStore();
  const [offline, setOffline] = useState(!navigator.onLine);
  const [offlineSnackbar, setOfflineSnackbar] = useState(false);

  useEffect(() => {
    const onOffline = () => {
      setOffline(true);
      setOfflineSnackbar(true);
    };
    const onOnline = () => {
      setOffline(false);
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  const currentNavValue = navItems.findIndex((n) => n.path === location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Offline Banner */}
      {offline && (
        <Box
          sx={{
            bgcolor: 'warning.main',
            color: 'white',
            py: 0.75,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <WifiOffIcon fontSize="small" />
          <Typography variant="caption" fontWeight={600}>
            Kamu sedang offline. Menu masih bisa dilihat dari cache.
          </Typography>
        </Box>
      )}

      {/* Top App Bar — Desktop */}
      {!isMobile && (
        <AppBar position="sticky" color="inherit" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              sx={{ cursor: 'pointer', mr: 4 }}
              onClick={() => navigate('/')}
            >
              🥟 Dapoer Baba Abdullah
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  color={location.pathname === item.path ? 'primary' : 'inherit'}
                  startIcon={item.icon}
                  aria-label={`Navigasi ke ${item.label}`}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Button
              startIcon={
                <Badge badgeContent={cartTotal} color="error" max={99}>
                  <ShoppingCartIcon />
                </Badge>
              }
              onClick={() => setCartSheetOpen(true)}
              color="primary"
              variant={cartTotal > 0 ? 'contained' : 'outlined'}
              aria-label={`Keranjang, ${cartTotal} item`}
              sx={{ mr: 2 }}
            >
              Keranjang
            </Button>
            <Tooltip title={highContrast ? 'Matikan kontras tinggi' : 'Aktifkan kontras tinggi'}>
              <IconButton
                onClick={toggleHighContrast}
                color={highContrast ? 'primary' : 'default'}
                aria-label={
                  highContrast ? 'Matikan mode kontras tinggi' : 'Aktifkan mode kontras tinggi'
                }
              >
                <ContrastIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <AppBar position="sticky" color="inherit" elevation={0}>
          <Toolbar>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              🥟 Dapoer Baba Abdullah
            </Typography>
            <IconButton
              onClick={toggleHighContrast}
              size="small"
              color={highContrast ? 'primary' : 'default'}
              aria-label={
                highContrast ? 'Matikan mode kontras tinggi' : 'Aktifkan mode kontras tinggi'
              }
            >
              <ContrastIcon />
            </IconButton>
            <IconButton
              onClick={toggleDarkMode}
              size="small"
              aria-label={darkMode ? 'Mode terang' : 'Mode gelap'}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pb: { xs: '56px', md: 0 } }}>
        {children}
      </Box>

      {/* Bottom Navigation — Mobile */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }} elevation={4}>
          <BottomNavigation
            value={currentNavValue === -1 ? false : currentNavValue}
            onChange={(_, newValue) => {
              if (newValue === 2) {
                setCartSheetOpen(true);
              } else {
                navigate(navItems[newValue].path);
              }
            }}
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} aria-label="Home" />
            <BottomNavigationAction label="Menu" icon={<RestaurantMenuIcon />} aria-label="Menu" />
            <BottomNavigationAction
              label="Keranjang"
              icon={
                <Badge badgeContent={cartTotal} color="error" max={99}>
                  <ShoppingCartIcon />
                </Badge>
              }
              aria-label={`Keranjang, ${cartTotal} item`}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Cart Bottom Sheet */}
      <CartBottomSheet />

      {/* Offline snackbar */}
      <Snackbar
        open={offlineSnackbar}
        autoHideDuration={4000}
        onClose={() => setOfflineSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setOfflineSnackbar(false)}>
          Koneksi internet terputus
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
