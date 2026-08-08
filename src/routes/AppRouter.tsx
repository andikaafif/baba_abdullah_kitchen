import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from '../components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// PWA pages
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const MenuPage = lazy(() => import('../pages/Menu/MenuPage'));
const CartPage = lazy(() => import('../pages/Cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/Checkout/CheckoutPage'));
const ConfirmationPage = lazy(() => import('../pages/Checkout/ConfirmationPage'));

// Dashboard pages
const DashboardLayout = lazy(() => import('../pages/Dashboard/DashboardLayout'));
const DashboardLoginPage = lazy(() => import('../pages/Dashboard/DashboardLoginPage'));
const DashboardOverviewPage = lazy(() => import('../pages/Dashboard/DashboardOverviewPage'));
const ProductListPage = lazy(() => import('../pages/Dashboard/products/ProductListPage'));
const ProductFormPage = lazy(() => import('../pages/Dashboard/products/ProductFormPage'));
const CategoriesPage = lazy(() => import('../pages/Dashboard/products/CategoriesPage'));
const InventoryPage = lazy(() => import('../pages/Dashboard/inventory/InventoryPage'));
const ReportsPage = lazy(() => import('../pages/Dashboard/reports/ReportsPage'));
const PromotionListPage = lazy(() => import('../pages/Dashboard/promotions/PromotionListPage'));
const PromotionFormPage = lazy(() => import('../pages/Dashboard/promotions/PromotionFormPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

const AppRouter: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* PWA customer-facing routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Route>

          {/* Dashboard routes (no PWA Layout wrapper) */}
          <Route path="/dashboard/login" element={<DashboardLoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/:id" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="promotions" element={<PromotionListPage />} />
            <Route path="promotions/new" element={<PromotionFormPage />} />
            <Route path="promotions/:id" element={<PromotionFormPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
);

export default AppRouter;
