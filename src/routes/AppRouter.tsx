import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from '../components/Layout';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const MenuPage = lazy(() => import('../pages/Menu/MenuPage'));
const CartPage = lazy(() => import('../pages/Cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/Checkout/CheckoutPage'));
const ConfirmationPage = lazy(() => import('../pages/Checkout/ConfirmationPage'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  </BrowserRouter>
);

export default AppRouter;
