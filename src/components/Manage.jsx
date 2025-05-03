import { Box, Typography, Button, Paper, Container, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Manage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh',
        py: isMobile ? 2 : 3,
        px: isMobile ? 2 : 3,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography 
        variant={isMobile ? "h5" : "h4"}
        component="h1" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          color: 'primary.main',
          fontWeight: 'bold',
          mb: isMobile ? 2 : 4
        }}
      >
        Video Management
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? 1.5 : 2,
        flex: 1
      }}>
        {/* Manage Library Button */}
        <Paper 
          elevation={3}
          sx={{ 
            p: isMobile ? 1.5 : 2,
            borderRadius: 2,
            background: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)',
            }
          }}
        >
          <Button
            fullWidth
            variant="contained"
            startIcon={<LibraryBooksIcon />}
            onClick={() => navigate('/manage/library')}
            sx={{
              py: isMobile ? 1.5 : 2,
              minHeight: isMobile ? '48px' : '56px',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            Manage Library
          </Button>
        </Paper>

        {/* Upload Video Button */}
        <Paper 
          elevation={3}
          sx={{ 
            p: isMobile ? 1.5 : 2,
            borderRadius: 2,
            background: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)',
            }
          }}
        >
          <Button
            fullWidth
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/manage/upload')}
            sx={{
              py: isMobile ? 1.5 : 2,
              minHeight: isMobile ? '48px' : '56px',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            Upload Video
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Manage; 