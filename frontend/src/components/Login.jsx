import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService.js';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('userId', res.data.userId);
      setMsg('');
      
      // Redirect based on role
      if (res.data.role === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/consumer-dashboard');
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              name="email"
              type="email"
              placeholder="Email address"
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          {/* Role is determined by backend, not selected during login */}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {msg && <p className="error-message">{msg}</p>}
        
        <div className="signup-section">
          <p className="signup-text">Don't have an account?</p>
          <button 
            type="button"
            onClick={() => navigate('/signup')}
            className="signup-button"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
