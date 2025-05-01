import { useState } from 'react';
import { Box, Typography, Container, Button, CircularProgress } from '@mui/material';
import { useSupabase } from '../../context/SupabaseContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Upload = () => {
  const { supabase } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      setError(null);

      const file = event.target.files[0];
      if (!file) return;

      // TODO: Implement file upload logic
      console.log('File selected:', file.name);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
        Upload Video
      </Typography>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <input
          accept="video/*"
          style={{ display: 'none' }}
          id="video-upload"
          type="file"
          onChange={handleUpload}
          disabled={uploading}
        />
        <label htmlFor="video-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            disabled={uploading}
            sx={{
              py: 2,
              px: 4,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Select Video'}
          </Button>
        </label>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Upload; 