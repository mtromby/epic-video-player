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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useSupabase } from '../../context/SupabaseContext';
import { useVirtualizer } from '@tanstack/react-virtual';

// Default thumbnail image as a base64 string to avoid external dependencies
const DEFAULT_THUMBNAIL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBUaHVtYm5haWw8L3RleHQ+PC9zdmc+';

const ITEMS_PER_PAGE = 12;
const THUMBNAIL_CACHE = new Map();

const Library = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { supabase } = useSupabase();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const videoRefs = useRef({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Memoized grid columns based on screen size
  const gridColumns = useMemo(() => {
    if (isMobile) return 1;
    if (theme.breakpoints.down('md')) return 2;
    if (theme.breakpoints.down('lg')) return 3;
    return 4;
  }, [isMobile, theme.breakpoints]);

  // Optimized thumbnail generation with caching
  const generateThumbnail = useCallback((videoUrl, videoId) => {
    if (THUMBNAIL_CACHE.has(videoId)) {
      return Promise.resolve(THUMBNAIL_CACHE.get(videoId));
    }

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      videoRefs.current[videoId] = video;

      video.addEventListener('loadeddata', () => {
        video.currentTime = video.duration / 2;
      });

      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob);
            THUMBNAIL_CACHE.set(videoId, thumbnailUrl);
            resolve(thumbnailUrl);
          } else {
            resolve(DEFAULT_THUMBNAIL);
          }
        }, 'image/jpeg', 0.8);
      });

      video.addEventListener('error', () => {
        resolve(DEFAULT_THUMBNAIL);
      });
    });
  }, []);

  // Fetch videos with pagination
  const fetchVideos = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const start = (pageNum - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('VIDEOS')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      const transformedVideos = await Promise.all(
        data.map(async (video) => ({
          id: video.id,
          title: video.title,
          thumbnail: await generateThumbnail(video.video_link, video.id),
          duration: video.duration || '0:00',
          uploadDate: video.created_at,
          views: video.views || 0,
          tags: video.tags || [],
          videoUrl: video.video_link,
        }))
      );

      setVideos(prev => pageNum === 1 ? transformedVideos : [...prev, ...transformedVideos]);
      setHasMore(count > end);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, generateThumbnail]);

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

  // Cleanup function
  useEffect(() => {
    return () => {
      videos.forEach(video => {
        if (video.thumbnail && video.thumbnail.startsWith('blob:')) {
          URL.revokeObjectURL(video.thumbnail);
        }
      });
      Object.values(videoRefs.current).forEach(video => {
        video.pause();
        video.src = '';
      });
      THUMBNAIL_CACHE.clear();
    };
  }, [videos]);

  const handleDelete = async (videoId) => {
    try {
      const { error } = await supabase
        .from('VIDEOS')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== videoId));
      THUMBNAIL_CACHE.delete(videoId);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMouseEnter = useCallback((video) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredVideo(video);
      const videoElement = videoRefs.current[video.id];
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play().catch(() => {});
      }
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredVideo(null);
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
      }
    });
  }, []);

  // Memoized VideoCard component
  const VideoCard = useCallback(({ video }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          '&:hover .video-preview': {
            opacity: 1,
            visibility: 'visible',
          }
        }}
        onMouseEnter={() => handleMouseEnter(video)}
        onMouseLeave={handleMouseLeave}
      >
        <CardMedia
          component="img"
          height="200"
          image={video.thumbnail}
          alt={video.title}
          loading="lazy"
        />
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
          }}
        >
          {video.duration}
        </Box>
        <Box
          className="video-preview"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <video
              ref={el => videoRefs.current[video.id] = el}
              src={video.videoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(1px)',
                transform: 'scale(1.1)',
              }}
              muted
              playsInline
              loop
              preload="none"
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.1)',
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <PlayArrowIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
          </Box>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom noWrap>
          {video.title}
        </Typography>
        <Box sx={{ mb: 1 }}>
          {video.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Views: {video.views.toLocaleString()}
        </Typography>
      </CardContent>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <IconButton size="small" color="primary">
          <PlayArrowIcon />
        </IconButton>
        <Box>
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => handleDelete(video.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  ), [handleMouseEnter, handleMouseLeave, theme.shadows]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        Video Library
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid key={video.id} xs={12} sm={6} md={4} lg={3}>
            <VideoCard video={video} />
          </Grid>
        ))}
      </Grid>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Intersection observer target */}
      <div ref={containerRef} style={{ height: '20px' }} />
    </Container>
  );
};

export default Library; 