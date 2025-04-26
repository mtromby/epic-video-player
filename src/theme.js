import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD700', // Gold
      contrastText: '#000000',
    },
    secondary: {
      main: '#000000', // Black
      contrastText: '#FFD700',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderTop: '1px solid #FFD700',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#FFD700',
          '&.Mui-selected': {
            color: '#FFD700',
          },
        },
      },
    },
  },
});

export default theme; 