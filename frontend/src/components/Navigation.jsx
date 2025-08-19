import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <nav className="navigation">
      <Link to="/" className="nav-brand">
        VideoShare
      </Link>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <span className="nav-separator">|</span>
        
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <span className="nav-separator">|</span>
            <Link to="/signup" className="nav-link">Signup</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <span className="nav-separator">|</span>
            {role === 'creator' && (
              <>
                <Link to="/upload" className="nav-link">Upload Video</Link>
                <span className="nav-separator">|</span>
              </>
            )}
            <Link to="/profile" className="nav-link">My Profile</Link>
            {role === 'creator' && (
              <>
                <span className="nav-separator">|</span>
                <Link to="/creator-dashboard" className="nav-link">Creator Dashboard</Link>
              </>
            )}
            {role && (
              <span className="user-role-badge">{role}</span>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
