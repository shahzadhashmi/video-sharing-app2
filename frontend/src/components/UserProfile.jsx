import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = ({ userId: propUserId }) => {
  const { id } = useParams();
  const userId = propUserId || id;
  const [user, setUser] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUserId = localStorage.getItem('userId');
  const isOwnProfile = userId === 'me' || userId === currentUserId;

  useEffect(() => {
    const fetchUserData = async () => {
      // Don't fetch if userId is undefined or null
      if (!userId || userId === 'undefined') {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        let targetUserId = userId;
        
        // Handle 'me' case
        if (userId === 'me') {
          if (!currentUserId) {
            setError('Please log in to view your profile');
            setLoading(false);
            return;
          }
          targetUserId = currentUserId;
        }
        
        // Ensure we have a valid user ID
        if (!targetUserId || targetUserId === 'undefined') {
          setError('Invalid user ID');
          setLoading(false);
          return;
        }

        const userRes = await axios.get(`http://localhost:5000/api/users/profile/${targetUserId}`);
        setUser(userRes.data);
        
        const videosRes = await axios.get(`http://localhost:5000/api/users/${targetUserId}/videos`);
        setUserVideos(videosRes.data);
      } catch (err) {
        setError('Error fetching user data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, currentUserId]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-not-found">User not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-content">
        <Link to="/dashboard" className="profile-back-link">← Back to Dashboard</Link>
        
        <div className="profile-header">
          <h1 className="profile-title">{user.username}'s Profile</h1>
          <div className="profile-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          
          {isOwnProfile && user.role === 'creator' && (
            <div className="profile-actions">
              <Link to="/upload" className="profile-button">Upload New Video</Link>
              <Link to="/creator-dashboard" className="profile-button" style={{ marginLeft: '1rem' }}>
                Creator Dashboard
              </Link>
            </div>
          )}
        </div>

        <div className="profile-videos-section">
          <h2 className="profile-videos-title">{user.username}'s Videos ({userVideos.length})</h2>
          {userVideos.length === 0 ? (
            <p className="profile-empty-state">No videos uploaded yet</p>
          ) : (
            <div className="profile-videos-grid">
              {userVideos.map(video => (
                <div key={video._id} className="profile-video-card">
                  <h3 className="profile-video-title">{video.title}</h3>
                  <p className="profile-video-description">{video.description}</p>
                  <Link to={`/videos/${video._id}`} className="profile-video-button">Watch</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
