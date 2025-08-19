import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from './VideoCard';

const ConsumerDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/videos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching videos');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading videos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Consumer Dashboard</h1>
      <p>Welcome! Browse and watch videos from your favorite creators.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>All Videos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {videos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
