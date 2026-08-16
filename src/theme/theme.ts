import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const brandColors = {
  primary: '#8B4513',
  secondary: '#D4A373',
  accent: '#F6C453',
  background: '#FFF8F0',
  surface: '#FFFFFF',
};

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none' },
};

const sharedComponents: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        // Safe area insets for iOS Safari notch / home indicator
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        // Prevent pull-to-refresh and overscroll bounce on Safari
        overscrollBehavior: 'none',
        // Smooth momentum scrolling on iOS
        WebkitOverflowScrolling: 'touch',
        // Prevent text size adjust on orientation change
        WebkitTextSizeAdjust: '100%',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        padding: '10px 24px',
        minHeight: 48,
        // Prevent tap highlight flash on Safari
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        fontWeight: 600,
        minHeight: 36,
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
        },
      },
    },
  },
  MuiBottomNavigation: {
    styleOverrides: {
      root: {
        height: 64,
        borderTop: `1px solid ${alpha(brandColors.primary, 0.12)}`,
        // Account for iOS home indicator
        paddingBottom: 'env(safe-area-inset-bottom)',
      },
    },
  },
  MuiBottomNavigationAction: {
    styleOverrides: {
      root: {
        minWidth: 56,
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      light: '#B5651D',
      dark: '#5C2E00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.secondary,
      light: '#E8C49A',
      dark: '#A57850',
      contrastText: '#000000',
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
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(139, 69, 19, 0.08)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(139, 69, 19, 0.16)',
            transform: 'translateY(-2px)',
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
      dark: '#8B4513',
      contrastText: '#000000',
    },
    secondary: {
      main: brandColors.secondary,
      light: '#E8C49A',
      dark: '#A57850',
      contrastText: '#000000',
    },
    background: {
      default: '#1A0E08',
      paper: '#2D1A0E',
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
          borderRadius: 20,
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
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
          borderRadius: 16,
          padding: '10px 24px',
          minHeight: 48,
          border: '2px solid currentColor',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '2px solid #000000',
          boxShadow: 'none',
        },
      },
    },
  },
});
