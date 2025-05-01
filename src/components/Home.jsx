import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip, IconButton, CircularProgress } from '@mui/material';
import { useSupabase } from '../context/SupabaseContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';

/**
 * TikTok-style video feed component that displays videos in a vertical scrollable interface.
 * Features:
 * - Full-screen video playback
 * - Auto-play on scroll
 * - Video information overlay
 * - Social interaction buttons
 * - Mobile-optimized design
 */
const Home = () => {
  console.log('=== HOME COMPONENT STARTING ===');
  
  const { supabase } = useSupabase();
  console.log('Supabase client:', supabase ? 'exists' : 'missing');
  
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerHeight, setContainerHeight] = useState('100vh');
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('VIDEOS')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection test successful:', data);
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };

    testConnection();
  }, [supabase]);

  // Debug log for initial render
  console.log('Home component rendered');

  // Calculate the proper height for the video container
  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const bottomNavHeight = 56; // Height of the bottom navigation bar
      const availableHeight = viewportHeight - bottomNavHeight;
      console.log('Container height calculated:', availableHeight);
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
      console.log('Fetching videos from Supabase...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('VIDEOS')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setError('Failed to fetch videos');
        return;
      }

      console.log('Videos fetched:', data);
      
      if (!data || data.length === 0) {
        console.log('No videos found in database');
        setError('No videos found');
        return;
      }

      setVideos(data);
    } catch (err) {
      console.error('Error in fetchVideos:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos on component mount
  useEffect(() => {
    console.log('Home component mounted, fetching videos...');
    fetchVideos();
  }, [supabase]);

  // Debug log for videos state
  useEffect(() => {
    console.log('Videos state updated:', videos);
    console.log('Current video index:', currentVideoIndex);
    if (videos[currentVideoIndex]) {
      console.log('Current video:', videos[currentVideoIndex]);
    }
  }, [videos, currentVideoIndex]);

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

        // Only play if still mounted and this is still the current video
        if (isMounted && currentVideo === videos[currentVideoIndex]) {
          await video.play();
        }
      } catch (err) {
        // Only log errors if component is still mounted
        if (isMounted) {
          console.error('Error playing video:', err);
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
  }, [currentVideoIndex, videos]);

  /**
   * Handles video errors
   * @param {Event} e - The error event
   */
  const handleVideoError = (e) => {
    const video = e.target;
    console.error('Video error details:', {
      src: video.src,
      error: video.error,
      readyState: video.readyState,
      networkState: video.networkState,
      errorCode: video.error?.code,
      errorMessage: video.error?.message
    });
    setError(`Failed to load video. Error code: ${video.error?.code || 'unknown'}`);
  };

  /**
   * Handles scroll events to switch between videos
   * Uses scroll snapping to ensure proper video transitions
   */
  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    
    // Calculate which video should be shown based on scroll position
    const newIndex = Math.round(scrollTop / clientHeight);
    
    if (newIndex !== currentVideoIndex) {
      console.log('Scrolling to video index:', newIndex);
      setCurrentVideoIndex(newIndex);
    }
  };

  // Loading state
  if (loading) {
    console.log('Rendering loading state');
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
    console.log('Rendering error state:', error);
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

  // Empty state
  if (!videos.length) {
    console.log('Rendering empty state');
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: containerHeight,
        backgroundColor: 'black'
      }}>
        <Typography>No videos found</Typography>
      </Box>
    );
  }

  console.log('Rendering video feed with', videos.length, 'videos');
  console.log('Current video index:', currentVideoIndex);
  console.log('Container height:', containerHeight);

  const currentVideo = videos[currentVideoIndex];

  // Main video feed
  return (
    <Box
      ref={containerRef}
      sx={{
        height: containerHeight,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        backgroundColor: 'black',
      }}
      onScroll={handleScroll}
    >
      {videos.map((video, index) => {
        console.log(`Rendering video ${index}:`, video);
        return (
          <Box
            key={video.id}
            sx={{
              height: containerHeight,
              width: '100%',
              position: 'relative',
              scrollSnapAlign: 'start',
              backgroundColor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <video
              ref={index === currentVideoIndex ? videoRef : null}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              controls={false}
              autoPlay={index === currentVideoIndex}
              loop
              muted
              playsInline
              crossOrigin="anonymous"
              onError={handleVideoError}
              src={video.video_link}
            />
            
            {/* Video Information Overlay */}
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
                {video.title}
              </Typography>
              
              {/* Performers */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                {video.performers?.map((performer, index) => (
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
                {video.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={`#${tag}`}
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Social Interaction Buttons */}
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
          </Box>
        );
      })}
    </Box>
  );
};

export default Home; 