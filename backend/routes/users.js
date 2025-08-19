import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import User from '../models/User.js';
import Video from '../models/Video.js';

const router = express.Router();

// Middleware to check user role
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.role !== requiredRole) {
        return res.status(403).json({ 
          message: `Access denied. ${requiredRole} role required.` 
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user ID format
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ message: 'Invalid user ID provided' });
    }
    
    // Check if it's a valid MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get creator dashboard (for content creators)
router.get('/creator/dashboard', verifyToken, checkRole('creator'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's videos
    const videos = await Video.find({ uploadedBy: userId })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    // Get user stats
    const totalVideos = await Video.countDocuments({ uploadedBy: userId });
    const totalViews = await Video.aggregate([
      { $match: { uploadedBy: userId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    res.json({
      videos,
      stats: {
        totalVideos,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get consumer dashboard (for regular users)
router.get('/consumer/dashboard', verifyToken, checkRole('consumer'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's watch history and preferences
    const user = await User.findById(userId)
      .populate('watchHistory')
      .populate('likedVideos');
    
    res.json({
      user: {
        username: user.username,
        email: user.email,
        watchHistory: user.watchHistory || [],
        likedVideos: user.likedVideos || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, bio },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's uploaded videos
router.get('/:id/videos', async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.params.id })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
