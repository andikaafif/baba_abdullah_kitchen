import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Chip,
} from '@mui/material';
import { Add, Delete, Lock } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../../services/userApi';

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [newPw, setNewPw] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userApi.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setAddOpen(false); setForm({ username: '', password: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const pwMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => userApi.changePassword(id, password),
    onSuccess: () => { setPwOpen(null); setNewPw(''); },
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manajemen Pengguna</Typography>
          <Typography variant="body2" color="text.secondary">Kelola akun admin dashboard</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)} sx={{ fontWeight: 700 }}>
          Tambah Pengguna
        </Button>
      </Box>

      {isLoading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Dibuat</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Chip label={u.username} size="small" />
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => setPwOpen(u.id)} title="Ganti Password">
                      <Lock fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(u.id)} title="Hapus">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow><TableCell colSpan={3} align="center">Belum ada pengguna</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add user dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah Pengguna</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} fullWidth />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={() => createMutation.mutate(form)} disabled={!form.username || !form.password}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={pwOpen !== null} onClose={() => setPwOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Ganti Password</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField label="Password Baru" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwOpen(null)}>Batal</Button>
          <Button variant="contained" onClick={() => pwOpen && pwMutation.mutate({ id: pwOpen, password: newPw })} disabled={!newPw}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
