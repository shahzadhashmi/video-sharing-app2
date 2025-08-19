import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/apiService.js';
import './Signup.css';

const Signup = () => {
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'consumer' 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMsg('');

      try {
        const { confirmPassword, ...signupData } = form;
        await authAPI.signup(signupData);
        
        setMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setMsg(err.response?.data?.message || 'Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#e0e0e0';
    if (passwordStrength <= 25) return '#ff4444';
    if (passwordStrength <= 50) return '#ff8800';
    if (passwordStrength <= 75) return '#ffaa00';
    return '#00c851';
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-left">
          <div className="brand-section">
            <div className="logo">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3Z" fill="#007bff"/>
                <path d="M10 8L16 12L10 16V8Z" fill="white"/>
              </svg>
            </div>
            <h1>Join VideoShare</h1>
            <p>Create your account and start sharing amazing videos with the world</p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🎥</span>
                <span>Upload unlimited videos</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Connect with creators</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Track your growth</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-right">
          <div className="form-container">
            <h2>Create Account</h2>
            <p className="subtitle">Get started with your free account</p>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  className={errors.username ? 'error' : ''}
                  required
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${passwordStrength}%`, 
                          backgroundColor: getPasswordStrengthColor() 
                        }}
                      />
                    </div>
                    <span className="strength-text">
                      {passwordStrength === 0 ? '' : 
                       passwordStrength <= 25 ? 'Weak' :
                       passwordStrength <= 50 ? 'Fair' :
                       passwordStrength <= 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">Account Type</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="role-select"
                >
                  <option value="consumer">Consumer - Watch and interact</option>
                  <option value="creator">Creator - Upload and share videos</option>
                </select>
              </div>

              <button 
                type="submit" 
                className={`submit-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {msg && (
                <div className={`message ${msg.includes('success') ? 'success' : 'error'}`}>
                  {msg}
                </div>
              )}
            </form>

            <div className="login-link">
              <p>Already have an account?</p>
              <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
