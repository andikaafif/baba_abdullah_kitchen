import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  ToggleButton, ToggleButtonGroup, CircularProgress, Chip, TablePagination,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi, type ExpensePeriod } from '../../../services/expenseApi';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function getDefaultRange(period: ExpensePeriod) {
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

const ExpensesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<ExpensePeriod>('daily');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ purpose: '', quantity: 1, original_price: 0 });
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const { from, to } = getDefaultRange(period);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', from, to],
    queryFn: () => expenseApi.list(from, to).then(r => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['expenses-summary', period, from, to],
    queryFn: () => expenseApi.summary(period, from, to).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['expenses-summary'] }); setDialogOpen(false); setForm({ purpose: '', quantity: 1, original_price: 0 }); },
  });

  const deleteMutation = useMutation({
    mutationFn: expenseApi.remove,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['expenses-summary'] }); },
  });

  const totalExpense = expenses?.reduce((sum, e) => sum + Number(e.expense_cost), 0) ?? 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Laporan Pengeluaran</Typography>
          <Typography variant="body2" color="text.secondary">Kelola dan pantau pengeluaran bisnis</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 700 }}>
          Tambah Pengeluaran
        </Button>
      </Box>

      {/* Period filter */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup value={period} exclusive onChange={(_e, v) => v && setPeriod(v)} size="small">
          <ToggleButton value="daily">Harian</ToggleButton>
          <ToggleButton value="weekly">Mingguan</ToggleButton>
          <ToggleButton value="monthly">Bulanan</ToggleButton>
        </ToggleButtonGroup>
        <Chip label={`Total: ${formatRp(totalExpense)}`} color="error" variant="outlined" sx={{ fontWeight: 700 }} />
      </Box>

      {/* Summary cards */}
      {summary && summary.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {summary.slice(-5).map((s) => (
            <Card key={s.period_label} sx={{ minWidth: 150, flex: '1 1 150px' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">{(() => { const raw = s.last_entry_at || s.period_label; const d = new Date(raw); const p = (n: number) => String(n).padStart(2, '0'); if (raw.length <= 10) return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`; return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; })()}</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{formatRp(s.total_expense)}</Typography>
                <Typography variant="caption" color="text.secondary">{s.item_count} item</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Table */}
      {isLoading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Keperluan</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Harga Satuan</TableCell>
                <TableCell align="right">Biaya</TableCell>
                <TableCell align="right">Tanggal</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.purpose}</TableCell>
                  <TableCell align="right">{e.quantity}</TableCell>
                  <TableCell align="right">{formatRp(e.original_price)}</TableCell>
                  <TableCell align="right">{formatRp(e.expense_cost)}</TableCell>
                  <TableCell align="right">{(() => { const d = new Date(e.created_at); const p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; })()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(e.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!expenses || expenses.length === 0) && (
                <TableRow><TableCell colSpan={6} align="center">Belum ada data pengeluaran</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={expenses?.length ?? 0}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[15]}
          />
        </TableContainer>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah Pengeluaran</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Keperluan" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} fullWidth />
          <TextField label="Jumlah Beli" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} fullWidth />
          <TextField label="Harga Satuan (Rp)" type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} fullWidth />
          <Typography variant="body2" color="text.secondary">
            Biaya: {formatRp(form.original_price * form.quantity)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={() => createMutation.mutate(form)} disabled={!form.purpose || !form.quantity || !form.original_price}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpensesPage;
