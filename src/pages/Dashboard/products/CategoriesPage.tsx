import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert,
} from '@mui/material';
import { Add, Edit, Delete, Save, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../../services/productApi';

const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => categoryApi.create({ name: newName, slug: newSlug }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName(''); setNewSlug(''); setShowAdd(false);
    },
    onError: () => setError('Gagal menambah kategori'),
  });

  const updateMutation = useMutation({
    mutationFn: () => categoryApi.update(editId!, { name: editName, slug: editSlug }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditId(null);
    },
    onError: () => setError('Gagal update kategori'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
    },
  });

  const startEdit = (c: { id: number; name: string; slug: string }) => {
    setEditId(c.id); setEditName(c.name); setEditSlug(c.slug);
  };

  const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Kategori Produk</Typography>
          <Typography variant="body2" color="text.secondary">Kelola kategori menu</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowAdd(true)} sx={{ fontWeight: 700 }}>
          Tambah Kategori
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Add form */}
      {showAdd && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Kategori Baru</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Nama"
                size="small"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewSlug(toSlug(e.target.value)); }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Slug"
                size="small"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button variant="contained" startIcon={<Save />} onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newName || !newSlug}>
                Simpan
              </Button>
              <Button variant="outlined" startIcon={<Close />} onClick={() => setShowAdd(false)}>Batal</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFF3E0' }}>
              <TableCell sx={{ fontWeight: 700 }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
            ) : categories?.map((c) => (
              <TableRow key={c.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#FFFAF5' } }}>
                <TableCell>
                  {editId === c.id ? (
                    <TextField size="small" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editId === c.id ? (
                    <TextField size="small" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">{c.slug}</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {editId === c.id ? (
                    <>
                      <IconButton size="small" color="primary" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                        <Save fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setEditId(null)}>
                        <Close fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton size="small" color="primary" onClick={() => startEdit(c)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}><Delete fontSize="small" /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Hapus Kategori?</DialogTitle>
        <DialogContent><Typography>Semua produk dalam kategori ini mungkin terpengaruh.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Batal</Button>
          <Button color="error" variant="contained" disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
