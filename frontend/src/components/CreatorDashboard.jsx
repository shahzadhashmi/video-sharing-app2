import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CreatorDashboard = () => {
  const [creatorVideos, setCreatorVideos] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const videosRes = await axios.get(`http://localhost:5000/api/videos/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreatorVideos(videosRes.data);
        
        // Calculate stats
        const totalViews = videosRes.data.reduce((sum, video) => sum + (video.views || 0), 0);
        const totalLikes = videosRes.data.reduce((sum, video) => sum + (video.likes || 0), 0);
        const totalComments = videosRes.data.reduce((sum, video) => sum + (video.comments?.length || 0), 0);
        
        setStats({
          totalVideos: videosRes.data.length,
          totalViews,
          totalLikes,
          totalComments
        });
      } catch (err) {
        setError('Error fetching creator data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreatorData();
  }, [userId, token]);

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh data
        const videosRes = await axios.get(`http://localhost:5000/api/videos/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreatorVideos(videosRes.data);
      } catch (err) {
        alert('Error deleting video');
      }
    }
  };

  if (loading) return <div>Loading creator dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Creator Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3>{stats.totalVideos}</h3>
          <p>Total Videos</p>
        </div>
        <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3>{stats.totalViews}</h3>
          <p>Total Views</p>
        </div>
        <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3>{stats.totalLikes}</h3>
          <p>Total Likes</p>
        </div>
        <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3>{stats.totalComments}</h3>
          <p>Total Comments</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <Link to="/upload">
          <button style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Upload New Video
          </button>
        </Link>
      </div>

      <div>
        <h2>Your Videos ({creatorVideos.length})</h2>
        {creatorVideos.length === 0 ? (
          <p>No videos uploaded yet. <Link to="/upload">Upload your first video!</Link></p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {creatorVideos.map(video => (
              <div key={video._id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <p><strong>Views:</strong> {video.views || 0}</p>
                <p><strong>Likes:</strong> {video.likes || 0}</p>
                <p><strong>Comments:</strong> {video.comments?.length || 0}</p>
                
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/videos/${video._id}`}>
                    <button style={{ marginRight: '0.5rem' }}>View</button>
                  </Link>
                  <Link to={`/edit/${video._id}`}>
                    <button style={{ marginRight: '0.5rem' }}>Edit</button>
                  </Link>
                  <button 
                    onClick={() => handleDeleteVideo(video._id)}
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
