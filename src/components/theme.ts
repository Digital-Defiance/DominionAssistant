import { createTheme, Theme } from '@mui/material/styles';

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    text: {
      primary: '#000000',
    },
  },
  typography: {
    h6: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            minWidth: 44,
            minHeight: 44,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            width: 48,
            height: 48,
          },
        },
      },
    },
  },
});

export default theme;
