/**
 * VideoPlayer component that handles video playback with loading states and error handling
 * @param {Object} props
 * @param {string} props.videoUrl - The URL of the video to play
 * @param {boolean} props.isActive - Whether this video is currently active
 * @param {Function} props.onError - Callback for video errors
 */
import { forwardRef, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

const VideoPlayer = forwardRef(({ videoUrl, isActive, onError }, ref) => {
  const [isLoading, setIsLoading] = useState(true);

  // Handle video source and playback when props change
  useEffect(() => {
    if (ref.current && videoUrl) {
      const video = ref.current;
      setIsLoading(true);
      
      // Set up video source
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      
      // Load and play if active
      if (isActive) {
        video.load();
        video.play().catch(err => {
          onError?.(err);
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }

      // Handle video loading
      const handleLoadedData = () => {
        setIsLoading(false);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
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
        position: 'relative',
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Video element */}
      <video
        ref={ref}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
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