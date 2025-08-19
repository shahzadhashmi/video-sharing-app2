import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  // Build full URL for video playback
  const getVideoUrl = () => {
    // Use formats if available, otherwise use filePath
    const relativePath = video.formats?.mp4 || video.filePath;
    
    if (!relativePath || relativePath === 'undefined') {
      return null;
    }
    
    // Ensure the path doesn't have leading slash
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    
    return `http://localhost:5000/${cleanPath}`;
  };

  const videoUrl = getVideoUrl();
  const hasValidVideo = Boolean(videoUrl);

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px',
      width: '300px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Link to={`/video/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div>
          {hasValidVideo ? (
            <video
              src={videoUrl}
              controls
              width="100%"
              height="180"
              style={{
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div style={{
              width: '100%',
              height: '180px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              Video not available
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            <h3 style={{
              margin: '0 0 5px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {video.title}
            </h3>
            <p style={{
              margin: '0 0 5px 0',
              fontSize: '14px',
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {video.description}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#888'
            }}>
              <span>{video.uploader?.username || 'Unknown Creator'}</span>
              <span>{video.views || 0} views</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
