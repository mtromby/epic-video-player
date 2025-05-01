import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Manage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ height: '100%', py: 3 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          color: 'primary.main',
          fontWeight: 'bold',
          mb: 4
        }}
      >
        Video Management
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Manage Library Button */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 2,
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
              py: 2,
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
            p: 2,
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
              py: 2,
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