import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const brandColors = {
  primary: '#A0522D',       // Sienna – warm, appetizing brown
  secondary: '#E8B88A',     // Soft peach
  accent: '#F6C453',        // Golden honey
  success: '#4CAF50',
  background: '#FFFAF5',    // Warm cream
  surface: '#FFFFFF',
};

/* ── Shared global CSS keyframes ──────────────────────────────── */
const globalKeyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.06); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
`;

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, letterSpacing: '-0.01em' },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
};

const sharedComponents: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: `
      ${globalKeyframes}
      body {
        padding-top: env(safe-area-inset-top);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        -webkit-text-size-adjust: 100%;
      }
      ::selection {
        background: ${alpha(brandColors.primary, 0.18)};
      }
    `,
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        padding: '10px 24px',
        minHeight: 48,
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 14px ${alpha(brandColors.primary, 0.18)}`,
        },
        '&:active': {
          transform: 'translateY(0) scale(0.98)',
        },
      },
      contained: {
        boxShadow: `0 2px 8px ${alpha(brandColors.primary, 0.2)}`,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: `0 4px 20px ${alpha(brandColors.primary, 0.25)}`,
        '&:hover': {
          transform: 'scale(1.08)',
          boxShadow: `0 6px 28px ${alpha(brandColors.primary, 0.35)}`,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600,
        minHeight: 36,
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 14,
          transition: 'box-shadow 0.2s ease',
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(brandColors.primary, 0.12)}`,
          },
        },
      },
    },
  },
  MuiBottomNavigation: {
    styleOverrides: {
      root: {
        height: 68,
        borderTop: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: alpha('#FFFFFF', 0.85),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    },
  },
  MuiBottomNavigationAction: {
    styleOverrides: {
      root: {
        minWidth: 56,
        WebkitTapHighlightColor: 'transparent',
        transition: 'color 0.2s ease, transform 0.2s ease',
        '&.Mui-selected': {
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        borderBottom: `1px solid ${alpha(brandColors.primary, 0.08)}`,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none',
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      light: '#C4784A',
      dark: '#6D3418',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.secondary,
      light: '#F2D4B4',
      dark: '#B8865A',
      contrastText: '#3E2210',
    },
    success: {
      main: brandColors.success,
    },
    background: {
      default: brandColors.background,
      paper: brandColors.surface,
    },
    warning: {
      main: brandColors.accent,
    },
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 16,
  },
  components: {
    ...sharedComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: `1px solid ${alpha(brandColors.primary, 0.06)}`,
          boxShadow: `0 1px 3px ${alpha(brandColors.primary, 0.04)}, 0 4px 16px ${alpha(brandColors.primary, 0.06)}`,
          transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
          animation: 'fadeInUp 0.5s ease both',
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(brandColors.primary, 0.14)}`,
            transform: 'translateY(-4px)',
            borderColor: alpha(brandColors.primary, 0.12),
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4956A',
      light: '#E8B08A',
      dark: '#A0522D',
      contrastText: '#1A0E08',
    },
    secondary: {
      main: '#E8B88A',
      light: '#F2D4B4',
      dark: '#A57850',
      contrastText: '#1A0E08',
    },
    background: {
      default: '#151010',
      paper: '#231815',
    },
    warning: {
      main: brandColors.accent,
    },
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 16,
  },
  components: {
    ...sharedComponents,
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 68,
          borderTop: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: alpha('#231815', 0.88),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
          animation: 'fadeInUp 0.5s ease both',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
        },
      },
    },
  },
});

export const highContrastTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5C2E00',
      light: '#8B4513',
      dark: '#2E1700',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7A4A18',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#1A1A1A',
    },
    divider: '#000000',
    warning: {
      main: '#8A6200',
    },
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 16,
  },
  components: {
    ...sharedComponents,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '10px 24px',
          minHeight: 48,
          border: '2px solid currentColor',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: '2px solid #000000',
          boxShadow: 'none',
        },
      },
    },
  },
});
