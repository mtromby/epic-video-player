import { Box, Typography } from '@mui/material';

const Manage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage
      </Typography>
      <Typography variant="body1">
        Manage your account and settings.
      </Typography>
    </Box>
  );
};

export default Manage; 