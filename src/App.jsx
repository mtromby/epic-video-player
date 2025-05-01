import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import theme from './theme';
import Home from './components/Home';
import Explore from './components/Explore';
import Performers from './components/Performers';
import Manage from './components/Manage';
import { SupabaseProvider } from './context/SupabaseContext';

function App() {
  const [value, setValue] = useState(0);
  
  // Get the base path from the environment or default to ''
  const basePath = import.meta.env.BASE_URL || '/epic-video-player';

  return (
    <SupabaseProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router basename={basePath}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh',
            overflow: 'hidden'
          }}>
            <div style={{ 
              flex: 1,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/performers" element={<Performers />} />
                <Route path="/manage" element={<Manage />} />
              </Routes>
            </div>
            
            <Paper 
              sx={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0,
                zIndex: 1000
              }} 
              elevation={3}
            >
              <BottomNavigation
                value={value}
                onChange={(event, newValue) => {
                  setValue(newValue);
                  const paths = ['/', '/explore', '/performers', '/manage'];
                  // Use window.location.pathname to preserve the base path
                  const newPath = `${basePath}${paths[newValue]}`;
                  window.location.href = newPath;
                }}
                showLabels
              >
                <BottomNavigationAction 
                  label="Home" 
                  icon={<HomeIcon />} 
                />
                <BottomNavigationAction 
                  label="Explore" 
                  icon={<ExploreIcon />} 
                />
                <BottomNavigationAction 
                  label="Performers" 
                  icon={<PeopleIcon />} 
                />
                <BottomNavigationAction 
                  label="Manage" 
                  icon={<SettingsIcon />} 
                />
              </BottomNavigation>
            </Paper>
          </div>
        </Router>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;
