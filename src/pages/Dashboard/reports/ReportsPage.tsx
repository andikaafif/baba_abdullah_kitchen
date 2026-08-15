import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab,
  ToggleButton, ToggleButtonGroup, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Chip, TablePagination,
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { reportApi, type Period } from '../../../services/reportApi';

const BRAND_COLORS = ['#8B4513', '#D4A373', '#F6C453', '#43A047', '#1976D2', '#E53935'];

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function getDefaultRange(period: Period) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'daily') from.setDate(from.getDate() - 29);
  else if (period === 'weekly') from.setDate(from.getDate() - 83);
  else from.setMonth(from.getMonth() - 11);
  const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
  return { from: fromStr, to: toStr };
}

const ReportsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState<Period>('daily');
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 15;
  const { from, to } = getDefaultRange(period);

  const { data: salesData, isLoading: loadingSales } = useQuery({
    queryKey: ['report-sales', period, from, to],
    queryFn: () => reportApi.sales(period, from, to).then((r) => r.data),
  });

  const { data: profitData, isLoading: loadingProfit } = useQuery({
    queryKey: ['report-profit', period, from, to],
    queryFn: () => reportApi.profit(period, from, to).then((r) => r.data),
  });

  const { data: topVariants, isLoading: loadingTop } = useQuery({
    queryKey: ['report-top-variants', period, from, to],
    queryFn: () => reportApi.topVariants({ limit: 10, from, to }).then((r) => r.data),
  });

  const { data: tableData, isLoading: loadingTable } = useQuery({
    queryKey: ['report-table', period, from, to],
    queryFn: () => reportApi.salesTable(from, to).then((r) => r.data as any[]),
  });

  const handleExport = () => reportApi.exportExcel(from, to);

  const periodLabel = period === 'daily' ? '30 Hari' : period === 'weekly' ? '12 Minggu' : '12 Bulan';

  const totalGrossRevenue = profitData?.reduce((s, d) => s + Number(d.total_revenue), 0) ?? 0;
  const totalNetProfit = profitData?.reduce((s, d) => s + Number(d.total_profit ?? 0), 0) ?? 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Laporan & Analitik</Typography>
          <Typography variant="body2" color="text.secondary">Penjualan, profit, dan varian terlaris</Typography>
        </Box>
        <Button variant="contained" startIcon={<FileDownload />} onClick={handleExport} sx={{ fontWeight: 700 }}>
          Export Excel
        </Button>
      </Box>

      {/* Period selector */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_e, v) => v && setPeriod(v)}
          size="small"
        >
          <ToggleButton value="daily">Harian</ToggleButton>
          <ToggleButton value="weekly">Mingguan</ToggleButton>
          <ToggleButton value="monthly">Bulanan</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Revenue & Profit Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary">Pendapatan Kotor (Gross Revenue) – {periodLabel}</Typography>
            <Typography variant="h6" fontWeight={700} color="#8B4513">{formatRp(totalGrossRevenue)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary">Laba Bersih (Net Profit) – {periodLabel}</Typography>
            <Typography variant="h6" fontWeight={700} color="#43A047">{formatRp(totalNetProfit)}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Penjualan" />
          <Tab label="Profit" />
          <Tab label="Varian Terlaris" />
          <Tab label="Tabel Penjualan" />
        </Tabs>

        <CardContent>
          {/* ---- Tab 0: Sales Chart ---- */}
          {tab === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Penjualan {periodLabel} Terakhir
              </Typography>
              {loadingSales ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={salesData ?? []} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e0d0" />
                    <XAxis
                      dataKey="period_label"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.length > 8 ? v.slice(5) : v}
                    />
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <RechartTooltip formatter={(val) => [formatRp(Number(val)), 'Pendapatan']} />
                    <Legend />
                    <Bar dataKey="total_revenue" name="Pendapatan" fill="#8B4513" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          )}

          {/* ---- Tab 1: Profit Chart ---- */}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Profit {periodLabel} Terakhir
              </Typography>
              {loadingProfit ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={profitData ?? []} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e0d0" />
                    <XAxis
                      dataKey="period_label"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.length > 8 ? v.slice(5) : v}
                    />
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <RechartTooltip formatter={(val, name) => [formatRp(Number(val)), name === 'total_profit' ? 'Profit' : 'Pendapatan']} />
                    <Legend />
                    <Line type="monotone" dataKey="total_revenue" name="Pendapatan" stroke="#D4A373" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="total_profit" name="Profit" stroke="#8B4513" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          )}

          {/* ---- Tab 2: Top Variants ---- */}
          {tab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Varian Terlaris ({periodLabel})
              </Typography>
              {loadingTop ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 280 }}>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={topVariants ?? []}
                          dataKey="total_sold"
                          nameKey="product_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={({ name, percent }) =>
                            `${String(name ?? '')} (${(((percent as number) ?? 0) * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {topVariants?.map((_v, i) => (
                            <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartTooltip formatter={(val) => [`${String(val)} terjual`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 280 }}>
                    {topVariants?.map((v, i) => (
                      <Box key={v.variant_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 12, height: 12, borderRadius: '50%',
                            bgcolor: BRAND_COLORS[i % BRAND_COLORS.length], flexShrink: 0,
                          }}
                        />
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {v.product_name} – {v.variant_label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {v.total_sold} terjual · {formatRp(Number(v.total_revenue))}
                          </Typography>
                        </Box>
                        <Chip label={v.category_name} size="small" sx={{ bgcolor: '#FFF3E0', color: '#8B4513', fontSize: 10 }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* ---- Tab 3: Sales Table ---- */}
          {tab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Tabel Penjualan ({periodLabel})
              </Typography>
              {loadingTable ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#FFF3E0' }}>
                        <TableCell sx={{ fontWeight: 700 }}>No. Order</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pelanggan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pengiriman</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pembayaran</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Profit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tanggal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage).map((row: any) => (
                        <TableRow key={row.order_number} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#FFFAF5' } }}>
                          <TableCell sx={{ fontSize: 12 }}>{row.order_number}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.customer_name}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.delivery_method}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.payment_method}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 12 }}>{formatRp(Number(row.total_price))}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 12 }}>{formatRp(Number(row.profit))}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              color={row.status === 'delivered' ? 'success' : row.status === 'cancelled' ? 'error' : 'default'}
                              sx={{ fontSize: 10 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            {(() => { const d = new Date(row.created_at); const p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={tableData?.length ?? 0}
                    page={tablePage}
                    onPageChange={(_e, p) => setTablePage(p)}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[15]}
                  />
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;
