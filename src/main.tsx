import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme, highContrastTheme } from './theme/theme';
import AppRouter from './routes/AppRouter';
import { useUIStore } from './store/uiStore';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

const AppWrapper: React.FC = () => {
  const darkMode = useUIStore((s) => s.darkMode);
  const highContrast = useUIStore((s) => s.highContrast);
  const theme = highContrast ? highContrastTheme : darkMode ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
