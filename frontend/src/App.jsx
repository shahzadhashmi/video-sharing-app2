import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UploadVideo from './components/UploadVideo';
import VideoDetail from './components/VideoDetail';
import UserProfile from './components/UserProfile';
import CreatorDashboard from './components/CreatorDashboard';
import ConsumerDashboard from './components/ConsumerDashboard';
import HomePage from './components/HomePage';

const App = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', marginBottom: '1rem' }}>
        <Link to="/">Home</Link> |{' '}
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            {role === 'consumer' && (
              <Link to="/consumer-dashboard">Consumer Dashboard</Link>
            )}
            {role === 'creator' && (
              <Link to="/creator-dashboard">Creator Dashboard</Link>
            )}
            | <Link to="/upload">Upload Video</Link> |
            <Link to="/profile">My Profile</Link>
          </>
        )}
      </nav>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/videos/:id" element={<VideoDetail />} />
        <Route path="/users/:id" element={<UserProfile />} />
        
        {/* Protected Routes */}
        <Route path="/consumer-dashboard" element={isLoggedIn && role === 'consumer' ? <ConsumerDashboard /> : <Navigate to="/login" />} />
        <Route path="/creator-dashboard" element={isLoggedIn && role === 'creator' ? <CreatorDashboard /> : <Navigate to="/login" />} />
        <Route path="/upload" element={isLoggedIn ? <UploadVideo /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isLoggedIn ? <UserProfile userId="me" /> : <Navigate to="/login" />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
