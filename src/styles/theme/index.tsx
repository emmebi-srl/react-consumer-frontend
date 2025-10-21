import React, { PropsWithChildren } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material';
import ComponentsOverride from './overrides';
import palette from './palette';

const ThemeConfig: React.FC<PropsWithChildren> = ({ children }) => {
  const theme = createTheme({
    palette,
    typography: {
      fontSize: 12,
    },
  });
  theme.components = ComponentsOverride(theme);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeConfig;
