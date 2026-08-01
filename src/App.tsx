import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme, highContrastTheme } from './theme/theme';
import AppRouter from './routes/AppRouter';
import { useUIStore } from './store/uiStore';

const App: React.FC = () => {
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

export default App;
