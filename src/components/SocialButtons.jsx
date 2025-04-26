import { Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';

/**
 * SocialButtons component for video interactions
 */
const SocialButtons = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        right: 16,
        bottom: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 1,
      }}
    >
      <IconButton sx={{ color: 'white' }}>
        <FavoriteIcon />
      </IconButton>
      <IconButton sx={{ color: 'white' }}>
        <CommentIcon />
      </IconButton>
      <IconButton sx={{ color: 'white' }}>
        <ShareIcon />
      </IconButton>
    </Box>
  );
};

export default SocialButtons; 