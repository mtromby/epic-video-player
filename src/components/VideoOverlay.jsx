import { Box, Typography, Chip } from '@mui/material';

/**
 * VideoOverlay component that displays video information
 * @param {Object} props
 * @param {string} props.title - The video title
 * @param {Array} props.performers - Array of performer names
 * @param {Array} props.tags - Array of video tags
 */
const VideoOverlay = ({ title, performers, tags }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        zIndex: 1,
      }}
    >
      <Typography variant="h6" color="white" gutterBottom>
        {title}
      </Typography>
      
      {/* Performers */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        {performers?.map((performer, index) => (
          <Chip
            key={index}
            label={performer}
            size="small"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        ))}
      </Box>
      
      {/* Tags */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {tags?.map((tag, index) => (
          <Chip
            key={index}
            label={`#${tag}`}
            size="small"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default VideoOverlay; 