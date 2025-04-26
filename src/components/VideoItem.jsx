import { Box } from '@mui/material';
import VideoPlayer from './VideoPlayer';
import VideoOverlay from './VideoOverlay';
import SocialButtons from './SocialButtons';

/**
 * VideoItem component that combines all video-related components
 * @param {Object} props
 * @param {Object} props.video - The video data object
 * @param {boolean} props.isActive - Whether this video is currently active
 * @param {Function} props.onError - Callback for video errors
 * @param {Object} props.videoRef - Reference to the video element
 */
const VideoItem = ({ video, isActive, onError, videoRef }) => {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <VideoPlayer
        ref={videoRef}
        videoUrl={video.video_link}
        isActive={isActive}
        onError={onError}
      />
      <VideoOverlay
        title={video.title}
        performers={video.performers}
        tags={video.tags}
      />
      <SocialButtons />
    </Box>
  );
};

export default VideoItem; 