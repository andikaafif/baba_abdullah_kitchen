import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Restaurant as RestaurantIcon } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const DashboardLoginPage: React.FC = () => {
  const { admin, login } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (admin) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ token: string; username: string }>('/api/auth/login', { username, password });
      login(res.data.username, res.data.token);
      navigate('/dashboard');
    } catch {
      setError('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2D1A0E 0%, #8B4513 100%)',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Brand */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 72, height: 72, borderRadius: 3, bgcolor: '#8B4513',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}
            >
              <RestaurantIcon sx={{ color: 'white', fontSize: 36 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Baba Abdullah Kitchen
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Admin Dashboard
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
              autoComplete="username"
            />
            <TextField
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((v) => !v)} edge="end">
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardLoginPage;
