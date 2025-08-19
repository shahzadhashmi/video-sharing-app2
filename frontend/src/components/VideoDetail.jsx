import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './VideoDetail.css';
import { getVideoUrlWithCacheBust } from '../utils/videoUtils';

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoRes = await axios.get(`http://localhost:5000/api/videos/${id}`);
        setVideo(videoRes.data);
        
        const commentsRes = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(commentsRes.data);
      } catch (err) {
        setError('Error fetching video details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      // Refresh comments
      const commentsRes = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(commentsRes.data);
    } catch (err) {
      alert('Error posting comment');
    }
  };

  if (loading) return <div className="loading-state">Loading video...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!video) return <div className="not-found-state">Video not found</div>;

  return (
    <div className="video-detail-container">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      
      <div className="video-header">
        <h1 className="video-title">{video.title}</h1>
        <div className="video-meta">
          <p>Uploaded by: <Link to={`/users/${video.uploader?._id}`} className="uploader-link">{video.uploader?.username}</Link></p>
        </div>
        <p className="video-description">{video.description}</p>
        
        <div className="video-player-container">
          {video.status === 'processing' ? (
            <div className="video-status processing">
              <h3>Video is processing...</h3>
              <p>Your video is being processed. Please check back in a few moments.</p>
            </div>
          ) : video.status === 'failed' ? (
            <div className="video-status failed">
              <h3>Video processing failed</h3>
              <p>There was an issue processing your video. Please try uploading again.</p>
            </div>
          ) : (
            <video className="video-player" controls>
              <source src={getVideoUrlWithCacheBust(video)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-header">Comments ({comments.length})</h3>
        {isLoggedIn && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              className="comment-textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
            />
            <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
              Post Comment
            </button>
          </form>
        )}
        
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment-item">
              <div className="comment-author">{comment.user?.username}</div>
              <div className="comment-text">{comment.text}</div>
              <div className="comment-timestamp">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
