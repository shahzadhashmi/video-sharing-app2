import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Rate limiting configuration
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const uploadRateLimit = createRateLimit(60 * 60 * 1000, 10); // 10 uploads per hour
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// File upload restrictions
export const fileUploadConfig = {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
};
