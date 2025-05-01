/**
 * TikTok-style video feed component that displays videos in a vertical scrollable interface.
 * Features:
 * - Full-screen video playback
 * - Auto-play on scroll
 * - Video information overlay
 * - Social interaction buttons
 * - Mobile-optimized design
 */
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip, IconButton, CircularProgress, Button, Paper } from '@mui/material';
import { useSupabase } from '../context/SupabaseContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const Home = () => {
  const { supabase } = useSupabase();
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerHeight, setContainerHeight] = useState('100vh');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const previewRef = useRef(null);

  // Calculate the proper height for the video container
  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const bottomNavHeight = 56; // Height of the bottom navigation bar
      const availableHeight = viewportHeight - bottomNavHeight;
      setContainerHeight(`${availableHeight}px`);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  /**
   * Fetches videos from Supabase database
   * Orders videos by creation date (newest first)
   */
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('VIDEOS')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch videos');
        return;
      }
      
      if (!data || data.length === 0) {
        setError('No videos found');
        return;
      }

      setVideos(data);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, [supabase]);

  // Handle video playback when current video changes
  useEffect(() => {
    let isMounted = true;
    let currentVideo = null;

    const playVideo = async () => {
      if (!videoRef.current || !videos.length || !isMounted) return;

      currentVideo = videos[currentVideoIndex];
      const video = videoRef.current;
      
      try {
        // Reset video state
        video.pause();
        video.currentTime = 0;
        
        // Set up video source
        video.crossOrigin = 'anonymous';
        video.src = currentVideo.video_link;
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          const handleLoad = () => {
            video.removeEventListener('loadeddata', handleLoad);
            video.removeEventListener('error', handleError);
            resolve();
          };

          const handleError = (e) => {
            video.removeEventListener('loadeddata', handleLoad);
            video.removeEventListener('error', handleError);
            reject(e);
          };

          video.addEventListener('loadeddata', handleLoad);
          video.addEventListener('error', handleError);
          video.load();
        });

        // Only play if still mounted, this is still the current video, and user has interacted
        if (isMounted && currentVideo === videos[currentVideoIndex] && hasUserInteracted) {
          await video.play();
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to play video: ${err.message}`);
        }
      }
    };

    playVideo();

    // Cleanup function
    return () => {
      isMounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [currentVideoIndex, videos, hasUserInteracted]);

  // Load preview frame for the welcome overlay
  useEffect(() => {
    if (videos.length > 0 && previewRef.current) {
      const video = previewRef.current;
      video.crossOrigin = 'anonymous';
      video.src = videos[0].video_link;
      video.currentTime = 3; // Set to 3 seconds
      
      const handlePreviewLoad = () => {
        setPreviewLoaded(true);
        video.removeEventListener('loadeddata', handlePreviewLoad);
      };
      
      video.addEventListener('loadeddata', handlePreviewLoad);
      return () => {
        video.removeEventListener('loadeddata', handlePreviewLoad);
      };
    }
  }, [videos]);

  /**
   * Handles video errors
   * @param {Event} e - The error event
   */
  const handleVideoError = (e) => {
    const video = e.target;
    setError(`Failed to load video. Error code: ${video.error?.code || 'unknown'}`);
  };

  /**
   * Handles scroll events to switch between videos
   * Uses scroll snapping to ensure proper video transitions
   */
  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    const newIndex = Math.round(scrollTop / clientHeight);
    
    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex);
    }
  };

  /**
   * Handles initial user interaction to start video playback
   */
  const handleInitialInteraction = async () => {
    try {
      if (videoRef.current) {
        // Reset video to beginning
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
        setHasUserInteracted(true);
      }
    } catch (err) {
      setError(`Failed to start playback: ${err.message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: containerHeight,
        backgroundColor: 'black'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: containerHeight,
        gap: 2,
        backgroundColor: 'black'
      }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: containerHeight,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        backgroundColor: 'black',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
      onScroll={handleScroll}
    >
      {videos.map((video, index) => (
        <Box
          key={video.id}
          sx={{
            height: containerHeight,
            scrollSnapAlign: 'start',
            position: 'relative'
          }}
        >
          <video
            ref={index === currentVideoIndex ? videoRef : null}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            playsInline
            muted={index !== currentVideoIndex}
            onError={handleVideoError}
          />
          
          {/* Initial welcome overlay */}
          {index === currentVideoIndex && !hasUserInteracted && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2
              }}
            >
              {/* Blurred preview */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  filter: 'blur(8px) brightness(0.8)',
                  transform: 'scale(1.05)',
                  opacity: previewLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  overflow: 'hidden'
                }}
              >
                <video
                  ref={previewRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scale(1.1)'
                  }}
                  muted
                  playsInline
                />
              </Box>

              {/* Welcome content */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 2,
                  background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4))'
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    width: '280px',
                    background: 'rgba(18, 18, 18, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 2,
                    textAlign: 'center',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                  }}
                >
                  <AutoAwesomeIcon 
                    sx={{ 
                      fontSize: 28, 
                      color: 'primary.main',
                      mb: 1
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mb: 0.5
                    }}
                  >
                    Welcome to Epic Video Player
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2,
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.875rem'
                    }}
                  >
                    Discover amazing content and immerse yourself in a world of entertainment
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleInitialInteraction}
                    sx={{
                      py: 0.75,
                      px: 2,
                      borderRadius: 1.5,
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }}
                  >
                    Start Your Journey
                  </Button>
                </Paper>
              </Box>
            </Box>
          )}
          
          {/* Video information overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 2,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white'
            }}
          >
            <Typography variant="h6">{video.title}</Typography>
            <Typography variant="body2">{video.description}</Typography>
            
            {/* Social interaction buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton color="primary">
                <FavoriteIcon />
              </IconButton>
              <IconButton color="primary">
                <ShareIcon />
              </IconButton>
              <IconButton color="primary">
                <CommentIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Home; 