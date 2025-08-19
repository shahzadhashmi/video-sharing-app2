import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getVideoUrlWithCacheBust } from '../utils/videoUtils';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/videos');
        setVideos(res.data);
      } catch (err) {
        setError('Error fetching videos');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <div>Loading videos...</div>;

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      {username && <p>Hello, {username}!</p>}
      
      <div style={{ marginBottom: '2rem' }}>
        {role === 'creator' && (
          <Link to="/upload">
            <button style={{ marginRight: '1rem' }}>Upload New Video</button>
          </Link>
        )}
        <Link to="/profile">
          <button style={{ marginRight: '1rem' }}>View My Profile</button>
        </Link>
        {role === 'creator' && (
          <Link to="/creator-dashboard">
            <button>Creator Dashboard</button>
          </Link>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <h2>All Videos</h2>
      {videos.length === 0 ? (
        <p>No videos uploaded yet</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {videos.map(video => (
            <div key={video._id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <p><strong>Creator:</strong> <Link to={`/users/${video.creator?._id}`}>{video.creator?.username}</Link></p>
              
              <Link to={`/videos/${video._id}`}>
                <button style={{ marginTop: '0.5rem' }}>Watch Video</button>
              </Link>
              
              <div style={{ marginTop: '1rem' }}>
                <video width="100%" controls style={{ maxWidth: '300px' }}>
                  <source src={getVideoUrlWithCacheBust(video)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
