/**
 * Main application component that sets up routing and navigation
 * Uses Material-UI for styling and React Router for navigation
 */
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import Library from './components/manage/Library';
import Upload from './components/manage/Upload';
import { SupabaseProvider } from './context/SupabaseContext';

// Separate component for the app content to use useNavigate
const AppContent = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  const handleNavigation = (newValue) => {
    setValue(newValue);
    const paths = ['/', '/explore', '/performers', '/manage'];
    navigate(paths[newValue]);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Main content area */}
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
          <Route path="/manage/library" element={<Library />} />
          <Route path="/manage/upload" element={<Upload />} />
        </Routes>
      </div>
      
      {/* Bottom navigation bar */}
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
          onChange={(event, newValue) => handleNavigation(newValue)}
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
  );
};

function App() {
  // Get the base path from the environment or default to ''
  const basePath = import.meta.env.BASE_URL || '/epic-video-player';

  return (
    <SupabaseProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router basename={basePath}>
          <AppContent />
        </Router>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;
