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
        background: 'linear-gradient(135deg, #1E120B 0%, #A0522D 50%, #C4784A 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(246,196,83,0.15) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        },
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 5, boxShadow: '0 12px 48px rgba(0,0,0,0.25)', animation: 'scaleIn 0.5s ease both' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Brand */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 76, height: 76, borderRadius: 4,
                background: 'linear-gradient(135deg, #A0522D, #C4784A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
                boxShadow: '0 4px 20px rgba(160,82,45,0.3)',
              }}
            >
              <RestaurantIcon sx={{ color: 'white', fontSize: 38 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary" letterSpacing="-0.01em">
              Baba Abdullah Kitchen
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ letterSpacing: '0.03em' }}>
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
