import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useSupabase } from '../../context/SupabaseContext';
import { useVirtualizer } from '@tanstack/react-virtual';

// Default thumbnail image as a base64 string to avoid external dependencies
const DEFAULT_THUMBNAIL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBUaHVtYm5haWw8L3RleHQ+PC9zdmc+';

const ITEMS_PER_PAGE = 8; // Reduced for better mobile performance

const Library = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { supabase } = useSupabase();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const containerRef = useRef(null);

  // Fetch videos with pagination
  const fetchVideos = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError(null);
      const start = (pageNum - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('VIDEOS')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setVideos([]);
        setHasMore(false);
        return;
      }

      // Transform videos using the video_thumbnail field
      const transformedVideos = data.map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.video_thumbnail || DEFAULT_THUMBNAIL,
        duration: video.duration || '0:00',
        uploadDate: video.created_at,
        views: video.views || 0,
        tags: video.tags || [],
        videoUrl: video.video_link,
      }));

      setVideos(prev => pageNum === 1 ? transformedVideos : [...prev, ...transformedVideos]);
      setHasMore(count > end);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
          fetchVideos(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchVideos]);

  // Cleanup function - simplified since we're not using blob URLs anymore
  useEffect(() => {
    return () => {
      setVideos([]);
    };
  }, []);

  const handleDelete = async (videoId) => {
    try {
      const { error } = await supabase
        .from('VIDEOS')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      setError(error.message);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  // Memoized VideoCard component
  const VideoCard = useCallback(({ video }) => {
    // State management
    const [isHovering, setIsHovering] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [currentClipIndex, setCurrentClipIndex] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    // Refs for video element and timeouts
    const videoRef = useRef(null);
    const timeoutRef = useRef(null);
    const clipsRef = useRef([]);

    /**
     * Generates preview clips for the video
     * Creates 7 evenly spaced 5-second clips throughout the video
     */
    const getPreviewClips = (duration) => {
      const clipDuration = 5;
      const totalClips = 7;
      const clips = [];
      const skipStartSeconds = 10; // Skip first 10 seconds

      // Adjust clip duration if video is shorter than total preview duration
      const adjustedClipDuration = Math.min(clipDuration, (duration - skipStartSeconds) / totalClips);

      // Create evenly spaced clips, starting after skipStartSeconds
      const availableDuration = duration - skipStartSeconds;
      for (let i = 0; i < totalClips; i++) {
        const startTime = skipStartSeconds + Math.floor((availableDuration / totalClips) * i);
        const endTime = Math.floor(startTime + adjustedClipDuration);
        clips.push({ start: startTime, end: endTime });
      }

      return clips;
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
      if (videoRef.current) {
        playCurrentClip();
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentClipIndex(0);
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      setIsHovering(true);
      if (videoRef.current) {
        playCurrentClip();
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      setIsHovering(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentClipIndex(0);
    };

    const playCurrentClip = () => {
      if (!videoRef.current) return;
      
      const clips = clipsRef.current;
      if (!clips || clips.length === 0) return;
      
      const clip = clips[currentClipIndex];
      videoRef.current.currentTime = clip.start;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silent error handling for autoplay restrictions
        });
      }

      // Schedule next clip transition
      const clipDuration = (clip.end - clip.start) * 1000;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (isHovering) {
          const nextIndex = (currentClipIndex + 1) % clips.length;
          setCurrentClipIndex(nextIndex);
          playCurrentClip();
        }
      }, clipDuration);
    };

    const handleTimeUpdate = () => {
      if (!videoRef.current || !isHovering) return;

      const clips = clipsRef.current;
      if (!clips || clips.length === 0) return;
      
      const clip = clips[currentClipIndex];
      if (videoRef.current.currentTime >= clip.end) {
        const nextIndex = (currentClipIndex + 1) % clips.length;
        setCurrentClipIndex(nextIndex);
        playCurrentClip();
      }
    };

    // Handle clip changes
    useEffect(() => {
      if (isHovering) {
        playCurrentClip();
      }
    }, [currentClipIndex, isHovering]);

    const handleVideoLoaded = () => {
      setIsVideoLoaded(true);
      if (videoRef.current) {
        const duration = videoRef.current.duration;
        setVideoDuration(duration);
        clipsRef.current = getPreviewClips(duration);
        
        // Pre-load the first clip
        if (clipsRef.current && clipsRef.current.length > 0) {
          const firstClip = clipsRef.current[0];
          videoRef.current.currentTime = firstClip.start;
        }
      }
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      };
    }, []);

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          width: '100%',
          '&:active': {
            transform: 'scale(0.98)',
          },
          borderRadius: isMobile ? 0 : 1,
          boxShadow: isMobile ? 'none' : 1,
        }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            cursor: 'pointer',
            height: isMobile ? 160 : 200,
          }}
          onMouseEnter={!isMobile ? handleMouseEnter : undefined}
          onMouseLeave={!isMobile ? handleMouseLeave : undefined}
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
          onClick={(e) => {
            e.stopPropagation();
            handleVideoSelect(video);
          }}
        >
          {/* Thumbnail Image */}
          <CardMedia
            component="img"
            height={isMobile ? "160" : "200"}
            image={video.thumbnail}
            alt={video.title}
            loading="lazy"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isHovering ? 0 : 1,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            }}
          />
          {/* Video Preview */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease',
              bgcolor: 'black',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          >
            <video
              ref={videoRef}
              src={video.videoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              muted
              playsInline
              preload="metadata"
              onLoadedData={handleVideoLoaded}
              onTimeUpdate={handleTimeUpdate}
            />
          </Box>
          {/* Duration Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              zIndex: 2,
              pointerEvents: 'none'
            }}
          >
            {video.duration}
          </Box>
        </Box>
        {/* Video Info */}
        <CardContent sx={{ 
          flexGrow: 1, 
          p: isMobile ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="h2" 
            gutterBottom 
            noWrap
            sx={{
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              fontWeight: 500
            }}
          >
            {video.title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5,
            mb: 0.5
          }}>
            {video.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ 
                  height: isMobile ? 20 : 24,
                  '& .MuiChip-label': {
                    px: isMobile ? 1 : 1.5,
                    fontSize: isMobile ? '0.7rem' : '0.875rem',
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            mt: 'auto'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: isMobile ? '0.7rem' : '0.875rem',
              }}
            >
              Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: isMobile ? '0.7rem' : '0.875rem'
              }}
            >
              Views: {video.views.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
        {/* Action Buttons */}
        <Box sx={{ 
          p: isMobile ? 0.5 : 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <IconButton 
            size={isMobile ? "small" : "medium"} 
            color="primary"
            sx={{ ml: -0.5 }}
          >
            <PlayArrowIcon />
          </IconButton>
          <Box>
            <IconButton 
              size={isMobile ? "small" : "medium"} 
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size={isMobile ? "small" : "medium"} 
              color="error"
              onClick={() => handleDelete(video.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>
    );
  }, [isMobile]);

  if (loading && videos.length === 0) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3
        }}
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => fetchVideos(1)}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (videos.length === 0) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3
        }}
      >
        <Typography variant="h6" align="center" color="text.secondary">
          No videos found
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 0 : 3,
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        gutterBottom
        sx={{
          mb: isMobile ? 2 : 4,
          fontWeight: 'bold',
          color: 'primary.main',
          px: isMobile ? 2 : 0,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          pt: 1
        }}
      >
        Video Library
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            mx: isMobile ? 2 : 0,
            position: 'sticky',
            top: isMobile ? '56px' : '64px',
            zIndex: 1
          }}
        >
          {error}
        </Alert>
      )}

      <Grid 
        container 
        spacing={isMobile ? 0 : 2}
        sx={{
          width: '100%',
          m: 0,
          flex: 1,
          pb: 2 // Add padding at bottom for better scrolling
        }}
      >
        {videos.map((video) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3} 
            key={video.id}
            sx={{
              p: isMobile ? 1 : 0,
              width: '100%'
            }}
          >
            <VideoCard video={video} />
          </Grid>
        ))}
      </Grid>

      {hasMore && (
        <Box 
          ref={containerRef} 
          sx={{ 
            height: '40px', // Increased height for better touch target
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: 1
          }}
        >
          {loading && <CircularProgress size={24} />}
        </Box>
      )}
    </Container>
  );
};

export default Library; 