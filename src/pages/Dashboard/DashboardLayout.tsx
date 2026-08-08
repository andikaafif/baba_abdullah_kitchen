import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Avatar, Tooltip, Divider, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  LocalOffer as PromotionIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Produk', path: '/dashboard/products', icon: <RestaurantIcon /> },
  { label: 'Inventori', path: '/dashboard/inventory', icon: <InventoryIcon /> },
  { label: 'Laporan', path: '/dashboard/reports', icon: <BarChartIcon /> },
  { label: 'Promosi', path: '/dashboard/promotions', icon: <PromotionIcon /> },
  { label: 'Kategori', path: '/dashboard/categories', icon: <CategoryIcon /> },
];

const SIDEBAR_BG = '#2D1A0E';
const SIDEBAR_ACTIVE = '#8B4513';

const DashboardLayout: React.FC = () => {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!admin) return <Navigate to="/dashboard/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/dashboard/login');
  };

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: SIDEBAR_BG }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#8B4513', width: 40, height: 40 }}>
          <RestaurantIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="white" lineHeight={1.2}>
            Baba Abdullah
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Kitchen Admin
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />

      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                mx: 1,
                borderRadius: 2,
                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.65)',
                bgcolor: isActive(item.path) ? SIDEBAR_ACTIVE : 'transparent',
                '&:hover': { bgcolor: isActive(item.path) ? SIDEBAR_ACTIVE : 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 400 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />

      {/* User info + logout */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#D4A373', color: '#2D1A0E', fontSize: 14, fontWeight: 700 }}>
          {admin.username[0].toUpperCase()}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={600} color="white" noWrap>{admin.username}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Administrator</Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFF8F0' }}>
      {/* Desktop permanent drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top AppBar (mobile only) */}
        {isMobile && (
          <AppBar position="sticky" sx={{ bgcolor: '#8B4513' }}>
            <Toolbar>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)} edge="start" sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>Baba Abdullah Kitchen</Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
