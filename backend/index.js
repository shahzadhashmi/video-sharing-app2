import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Increase timeout for large file uploads
app.use((req, res, next) => {
  // Set timeout to 5 minutes for upload routes
  if (req.path === '/api/videos/upload') {
    req.setTimeout(5 * 60 * 1000); // 5 minutes
    res.setTimeout(5 * 60 * 1000);
  }
  next();
});

// Global cache control middleware for API routes
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff'
  });
  next();
});

// MongoDB connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ Database connection error:', err));

// Serve uploads folder statically with cache control
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.includes('.mp4') || path.includes('.webm')) {
      res.set('Cache-Control', 'public, max-age=86400');
    } else {
      res.set('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// API Routes - Organized by feature
// Auth Routes: login, signup, logout
app.use('/api/auth', authRoutes);

// User Routes: creator dashboard, consumer dashboard, profile
app.use('/api/users', userRoutes);

// Video Routes: upload, view, manage videos
app.use('/api/videos', videoRoutes);

// Comment Routes: video comments, interactions
app.use('/api/comments', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎬 Welcome to the Video Sharing API!',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      videos: '/api/videos',
      comments: '/api/comments'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   Users: http://localhost:${PORT}/api/users`);
  console.log(`   Videos: http://localhost:${PORT}/api/videos`);
  console.log(`   Comments: http://localhost:${PORT}/api/comments`);
});
