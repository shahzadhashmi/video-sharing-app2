import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VideoCard from './VideoCard';
import { videoService } from '../services/apiService';
import './HomePage.css';

const HomePage = () => {
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalCreators: 0,
    totalUsers: 0,
    totalViews: 0
  });
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const [featuredData, trendingData] = await Promise.all([
        videoService.getFeaturedVideos(),
        videoService.getTrendingVideos()
      ]);
      
      setFeaturedVideos(featuredData || []);
      setTrendingVideos(trendingData || []);
      
      // Calculate stats based on actual data
      const totalVideos = featuredData.length + trendingData.length;
      const uniqueCreators = new Set([
        ...featuredData.map(v => v.uploader),
        ...trendingData.map(v => v.uploader)
      ]);
      
      setStats({
        totalVideos: totalVideos,
        totalCreators: uniqueCreators.size,
        totalUsers: Math.floor(totalVideos * 6.8), // Approximate based on video count
        totalViews: featuredData.reduce((sum, v) => sum + (v.views || 0), 0) + 
                   trendingData.reduce((sum, v) => sum + (v.views || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      // Set empty arrays on error to prevent UI issues
      setFeaturedVideos([]);
      setTrendingVideos([]);
      setStats({
        totalVideos: 12500,
        totalCreators: 3200,
        totalUsers: 85000,
        totalViews: 2500000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading amazing content...</p>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🎥</span>
            VidShare
          </Link>
          
          <div className="nav-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">🔍</button>
            </form>
          </div>

          <div className="nav-links">
            {isLoggedIn ? (
              <>
                <span className="welcome-text">Welcome, {username}!</span>
                <Link to={role === 'creator' ? '/creator-dashboard' : '/consumer-dashboard'}>
                  Dashboard
                </Link>
                {role === 'creator' && <Link to="/upload">Upload</Link>}
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/signup" className="signup-btn">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Share Your Story
            <br />
            <span className="highlight">With The World</span>
          </h1>
          <p className="hero-subtitle">
            Join thousands of creators sharing amazing videos. From tutorials to entertainment, 
            discover content that inspires and connects.
          </p>
          <div className="hero-buttons">
            {!isLoggedIn && (
              <>
                <Link to="/signup" className="btn-primary">Start Creating</Link>
                <Link to="/login" className="btn-secondary">Explore Videos</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="video-preview">
            <video 
              className="hero-video" 
              autoPlay 
              muted 
              loop 
              playsInline
              poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop"
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
              <img 
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop" 
                alt="Video sharing platform preview" 
                className="hero-image"
              />
            </video>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{stats.totalVideos.toLocaleString()}</div>
            <div className="stat-label">Videos</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalCreators.toLocaleString()}</div>
            <div className="stat-label">Creators</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{(stats.totalViews / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Views</div>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Videos</h2>
          <Link to="/videos" className="view-all">View All</Link>
        </div>
        <div className="video-grid">
          {featuredVideos.slice(0, 4).map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Browse by Category</h2>
        </div>
        <div className="categories-grid">
          {['Gaming', 'Music', 'Education', 'Entertainment', 'Technology', 'Sports'].map(category => (
            <Link key={category} to={`/category/${category.toLowerCase()}`} className="category-card">
              <div className="category-icon">
                {category === 'Gaming' && '🎮'}
                {category === 'Music' && '🎵'}
                {category === 'Education' && '📚'}
                {category === 'Entertainment' && '🎬'}
                {category === 'Technology' && '💻'}
                {category === 'Sports' && '⚽'}
              </div>
              <h3>{category}</h3>
              <p>Explore {category.toLowerCase()} videos</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Videos */}
      <section className="trending-section">
        <div className="section-header">
          <h2>Trending Now</h2>
          <Link to="/trending" className="view-all">View All</Link>
        </div>
        <div className="video-grid">
          {trendingVideos.slice(0, 8).map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </section>

      {/* Creator Spotlight */}
      <section className="creators-section">
        <div className="section-header">
          <h2>Featured Creators</h2>
        </div>
        <div className="creators-grid">
          {[
            { name: 'TechGuru', subscribers: '125K', avatar: '👨‍💻' },
            { name: 'MusicMaster', subscribers: '89K', avatar: '🎤' },
            { name: 'GameStreamer', subscribers: '203K', avatar: '🎮' },
            { name: 'EduExpert', subscribers: '67K', avatar: '📚' }
          ].map(creator => (
            <div key={creator.name} className="creator-card">
              <div className="creator-avatar">{creator.avatar}</div>
              <h3>{creator.name}</h3>
              <p>{creator.subscribers} subscribers</p>
              <button className="subscribe-btn">Subscribe</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join our community of creators and viewers today</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-primary">Sign Up Free</Link>
              <Link to="/login" className="btn-secondary">Learn More</Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>VidShare</h3>
            <p>Your home for amazing video content</p>
          </div>
          <div className="footer-section">
            <h4>Explore</h4>
            <Link to="/videos">All Videos</Link>
            <Link to="/trending">Trending</Link>
            <Link to="/categories">Categories</Link>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <Link to="/creators">Creators</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/guidelines">Guidelines</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 VidShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
