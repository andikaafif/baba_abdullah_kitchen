import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Select, MenuItem,
  FormControl, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Tooltip, ToggleButtonGroup, ToggleButton,
  TablePagination,
} from '@mui/material';
import { Visibility, WhatsApp } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, type Order } from '../../../services/orderApi';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'default' as const },
  { value: 'confirmed', label: 'Dikonfirmasi', color: 'info' as const },
  { value: 'preparing', label: 'Sedang Disiapkan', color: 'warning' as const },
  { value: 'ready', label: 'Siap', color: 'success' as const },
  { value: 'delivered', label: 'Dikirim/Diterima', color: 'success' as const },
  { value: 'cancelled', label: 'Dibatalkan', color: 'error' as const },
];

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: 'Halo {name}, pesanan Anda ({order}) telah dikonfirmasi. Kami sedang mempersiapkan pesanan Anda. Terima kasih! 🙏',
  preparing: 'Halo {name}, pesanan Anda ({order}) sedang dalam proses pembuatan. Mohon ditunggu ya! 🍳',
  ready: 'Halo {name}, pesanan Anda ({order}) sudah siap! Silakan diambil atau akan segera dikirim. 🎉',
  delivered: 'Halo {name}, pesanan Anda ({order}) sudah dikirim/diterima. Selamat menikmati! Terima kasih sudah memesan di Dapoer Baba Abdullah 🥟',
  cancelled: 'Halo {name}, mohon maaf pesanan Anda ({order}) terpaksa dibatalkan. Silakan hubungi kami untuk informasi lebih lanjut. 🙏',
};

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function buildWhatsAppUrl(phone: string, message: string): string {
  let normalized = phone.replace(/\D/g, '');
  if (normalized.startsWith('0')) normalized = '62' + normalized.slice(1);
  if (!normalized.startsWith('62')) normalized = '62' + normalized;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderApi.list(statusFilter ? { status: statusFilter } : undefined).then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => orderApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const handleStatusChange = (order: Order, newStatus: string) => {
    statusMutation.mutate({ id: order.id, status: newStatus });

    // Open WhatsApp to notify customer
    if (order.customer_phone && STATUS_MESSAGES[newStatus]) {
      const message = STATUS_MESSAGES[newStatus]
        .replace('{name}', order.customer_name)
        .replace('{order}', order.order_number);
      const url = buildWhatsAppUrl(order.customer_phone, message);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewDetail = async (order: Order) => {
    setDetailLoading(true);
    try {
      const res = await orderApi.get(order.id);
      setDetailOrder(res.data);
    } catch {
      setDetailOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status);
    return <Chip label={opt?.label || status} color={opt?.color || 'default'} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manajemen Pesanan</Typography>
          <Typography variant="body2" color="text.secondary">Kelola status pesanan dan kirim notifikasi ke pelanggan</Typography>
        </Box>
      </Box>

      {/* Status filter */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_e, v) => setStatusFilter(v ?? '')}
          size="small"
        >
          <ToggleButton value="">Semua</ToggleButton>
          {STATUS_OPTIONS.map(s => (
            <ToggleButton key={s.value} value={s.value}>{s.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {isLoading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No. Order</TableCell>
                <TableCell>Pelanggan</TableCell>
                <TableCell>Telepon</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ubah Status</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone || '-'}</TableCell>
                  <TableCell align="right">{formatRp(order.total_price)}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        size="small"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Lihat Detail">
                      <IconButton size="small" onClick={() => handleViewDetail(order)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {order.customer_phone && (
                      <Tooltip title="Kirim WhatsApp">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            const url = buildWhatsAppUrl(order.customer_phone!, `Halo ${order.customer_name}, terima kasih telah memesan di Dapoer Baba Abdullah! 🥟`);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <WhatsApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow><TableCell colSpan={7} align="center">Belum ada pesanan</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={orders?.length ?? 0}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[15]}
          />
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOrder !== null} onClose={() => setDetailOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Pesanan {detailOrder?.order_number}</DialogTitle>
        <DialogContent>
          {detailLoading ? <CircularProgress /> : detailOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              <Typography variant="body2"><strong>Pelanggan:</strong> {detailOrder.customer_name}</Typography>
              <Typography variant="body2"><strong>Telepon:</strong> {detailOrder.customer_phone || '-'}</Typography>
              <Typography variant="body2"><strong>Alamat:</strong> {detailOrder.customer_address || '-'}</Typography>
              <Typography variant="body2"><strong>Pengiriman:</strong> {detailOrder.delivery_method}</Typography>
              <Typography variant="body2"><strong>Pembayaran:</strong> {detailOrder.payment_method}</Typography>
              <Typography variant="body2"><strong>Catatan:</strong> {detailOrder.notes || '-'}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {getStatusChip(detailOrder.status)}</Typography>
              <Typography variant="body2"><strong>Tanggal:</strong> {new Date(detailOrder.created_at).toLocaleString('id-ID')}</Typography>

              {detailOrder.items && detailOrder.items.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>Item Pesanan:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Produk</TableCell>
                        <TableCell>Varian</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.variant_label}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{formatRp(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">{formatRp(detailOrder.total_price)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOrder(null)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
