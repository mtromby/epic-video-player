import { Box, Typography } from '@mui/material';

const Performers = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Performers
      </Typography>
      <Typography variant="body1">
        Browse through our talented performers.
      </Typography>
    </Box>
  );
};

export default Performers; 