import { forwardRef, useEffect } from 'react';
import { Box } from '@mui/material';

/**
 * VideoPlayer component that handles video playback
 * @param {Object} props
 * @param {string} props.videoUrl - The URL of the video to play
 * @param {boolean} props.isActive - Whether this video is currently active
 * @param {Function} props.onError - Callback for video errors
 */
const VideoPlayer = forwardRef(({ videoUrl, isActive, onError }, ref) => {
  // Handle video source and playback when props change
  useEffect(() => {
    if (ref.current && videoUrl) {
      const video = ref.current;
      
      // Set up video source
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      
      // Load and play if active
      if (isActive) {
        video.load();
        video.play().catch(err => {
          console.error('Error playing video:', err);
          onError?.(err);
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [videoUrl, isActive, ref, onError]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <video
        ref={ref}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
        controls={false}
        autoPlay={isActive}
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        onError={onError}
      />
    </Box>
  );
});

export default VideoPlayer; 