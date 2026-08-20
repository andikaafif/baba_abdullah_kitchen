import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, CircularProgress,
} from '@mui/material';
import {
  TrendingUp, ShoppingCart, Inventory,
  AccountBalance, MonetizationOn,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { reportApi } from '../../services/reportApi';
import { expenseApi } from '../../services/expenseApi';

const KpiCard: React.FC<{
  title: string; value: string; subtitle: string;
  icon: React.ReactNode; color: string;
}> = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{
        p: 1.5, borderRadius: 3,
        background: `linear-gradient(135deg, ${color}18, ${color}30)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary" fontSize="0.78rem">{title}</Typography>
        <Typography variant="h5" fontWeight={700} mt={0.25} letterSpacing="-0.01em">{value}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const DashboardOverviewPage: React.FC = () => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const monthStart = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const { data: monthlySales, isLoading: loadingMonthly } = useQuery({
    queryKey: ['overview-monthly', monthStart, todayStr],
    queryFn: () => reportApi.sales('daily', monthStart, todayStr).then((r) => r.data),
  });

  const { data: monthlyProfit } = useQuery({
    queryKey: ['overview-monthly-expenses', monthStart, todayStr],
    queryFn: () => expenseApi.list(monthStart, todayStr).then((r) => r.data),
  });

  const { data: topVariants, isLoading: loadingTop } = useQuery({
    queryKey: ['overview-top-variants'],
    queryFn: () => reportApi.topVariants({ limit: 5 }).then((r) => r.data),
  });

  const totalRevenue = monthlySales?.reduce((s, d) => s + Number(d.total_revenue), 0) ?? 0;
  const totalOrders = monthlySales?.reduce((s, d) => s + Number(d.order_count), 0) ?? 0;
  const totalExpenses = monthlyProfit?.reduce((s, e) => s + Number(e.expense_cost), 0) ?? 0;
  const totalNetProfit = totalRevenue - totalExpenses;
  const todayData = monthlySales?.find((d) => d.period_label === todayStr);
  const todayExpenses = monthlyProfit?.filter((e) => e.created_at.startsWith(todayStr)).reduce((s, e) => s + Number(e.expense_cost), 0) ?? 0;
  const todayNetProfit = Number(todayData?.total_revenue ?? 0) - todayExpenses;
  const todayItemsSold = Number(todayData?.total_items_sold ?? 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5} letterSpacing="-0.01em">Overview Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Selamat datang! Berikut ringkasan bulan ini.
      </Typography>

      <Grid container spacing={2.5} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Pendapatan Bulan Ini (Gross)"
            value={formatRp(totalRevenue)}
            subtitle="Total semua pesanan"
            icon={<TrendingUp />}
            color="#A0522D"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Laba Bersih Bulan Ini (Net)"
            value={formatRp(totalNetProfit)}
            subtitle="Pendapatan dikurangi pengeluaran"
            icon={<AccountBalance />}
            color="#1976D2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Pesanan Bulan Ini"
            value={totalOrders.toString()}
            subtitle="Jumlah transaksi"
            icon={<ShoppingCart />}
            color="#D4A373"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Penjualan Hari Ini"
            value={formatRp(Number(todayData?.total_revenue ?? 0))}
            subtitle={`${todayItemsSold} item terjual · ${todayData?.order_count ?? 0} pesanan`}
            icon={<MonetizationOn />}
            color="#F6C453"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Laba Bersih Hari Ini"
            value={formatRp(todayNetProfit)}
            subtitle="Pendapatan - pengeluaran hari ini"
            icon={<Inventory />}
            color="#43A047"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Sales Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Penjualan Harian (Bulan Ini)</Typography>
              {loadingMonthly ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlySales ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6dc" vertical={false} />
                    <XAxis
                      dataKey="period_label"
                      tickFormatter={(v: string) => v.slice(5)}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <RechartTooltip
                      formatter={(val) => [formatRp(Number(val)), 'Pendapatan']}
                      labelFormatter={(l) => `Tanggal: ${String(l)}`}
                    />
                    <Bar dataKey="total_revenue" fill="#A0522D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Variants */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Varian Terlaris</Typography>
              {loadingTop ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {topVariants?.slice(0, 5).map((v, i) => (
                    <Box key={v.variant_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 28, height: 28, borderRadius: '50%',
                          bgcolor: ['#A0522D', '#E8B88A', '#F6C453', '#43A047', '#1976D2'][i] + '18',
                          color: ['#A0522D', '#E8B88A', '#F6C453', '#43A047', '#1976D2'][i],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 12, flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {v.product_name} – {v.variant_label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {v.total_sold} terjual
                        </Typography>
                      </Box>
                      <Chip
                        label={v.category_name}
                        size="small"
                        sx={{ bgcolor: '#FFF3E0', color: '#A0522D', fontWeight: 600, fontSize: 10 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverviewPage;
