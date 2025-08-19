import express from 'express';
import multer from 'multer';
import path from 'path';
import verifyToken from '../middleware/verifyToken.js';
import Video from '../models/Video.js';
import videoProcessor from '../services/videoProcessor.js';

const router = express.Router();

// Set up multer for file uploads with enhanced configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix);
  }
});

// Enhanced multer configuration with file size limits and validation
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow video files only
    const allowedMimes = [
      'video/mp4',
      'video/webm',
      'video/avi',
      'video/mov',
      'video/mkv',
      'video/quicktime'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});

// POST /api/videos/upload
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
  try {
    // Check if user is a creator
    if (req.user.role !== 'creator') {
      return res.status(403).json({ 
        message: 'Access denied: Only creators can upload videos' 
      });
    }

    // Validate required fields
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Title and description are required' 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No video file uploaded' 
      });
    }

    // Create initial video document
    const newVideo = new Video({
      title: title.trim(),
      description: description.trim(),
      filePath: req.file.path, // Add the required filePath field
      uploader: req.user.id,
      status: 'processing',
      originalFilename: req.file.originalname,
      fileSize: req.file.size
    });
    
    await newVideo.save();
    
    // Process video asynchronously
    const inputPath = req.file.path;
    const outputDir = path.join('uploads', 'processed', newVideo._id.toString());
    
    // Start processing in background
    processVideoAsync(newVideo._id, inputPath, outputDir, req);
    
    res.status(201).json({ 
      message: 'Video uploaded successfully - processing in background', 
      video: newVideo,
      status: 'processing'
    });
  } catch (error) {
    // Handle multer-specific errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: 'File too large. Maximum file size is 100MB' 
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${error.message}` 
      });
    }
    
    // Handle other errors
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Enhanced error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        message: 'File too large. Maximum file size is 100MB' 
      });
    }
    return res.status(400).json({ 
      message: `Upload error: ${error.message}` 
    });
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(415).json({ 
      message: error.message 
    });
  }
  
  next(error);
});

// Background video processing
async function processVideoAsync(videoId, inputPath, outputDir, req) {
  try {
    const video = await Video.findById(videoId);
    if (!video) return;

    const results = await videoProcessor.processVideo(inputPath, outputDir, videoId);
    
    // Update video with processed URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    video.formats = {
      mp4: `${baseUrl}/${results.mp4.replace(/\\/g, '/')}`,
      webm: `${baseUrl}/${results.webm.replace(/\\/g, '/')}`,
      h264: `${baseUrl}/${results.mp4.replace(/\\/g, '/')}`
    };
    
    video.qualities = {
      '360p': results.qualities['360p'] ? `${baseUrl}/${results.qualities['360p'].replace(/\\/g, '/')}` : null,
      '480p': results.qualities['480p'] ? `${baseUrl}/${results.qualities['480p'].replace(/\\/g, '/')}` : null,
      '720p': results.qualities['720p'] ? `${baseUrl}/${results.qualities['720p'].replace(/\\/g, '/')}` : null
    };
    
    video.status = 'ready';
    await video.save();
    
    // Clean up original file
    await videoProcessor.cleanup([inputPath]);
    
  } catch (error) {
    console.error('Video processing failed:', error);
    const video = await Video.findById(videoId);
    if (video) {
      video.status = 'failed';
      await video.save();
    }
  }
}

// GET /api/videos (to fetch all videos)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('uploader', 'username')
      .sort({ createdAt: -1 });
    
    // Add cache-busting timestamp
    const timestamp = Date.now();
    const videosWithTimestamp = videos.map(video => ({
      ...video.toObject(),
      _timestamp: timestamp
    }));
    
    res.json(videosWithTimestamp);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// GET /api/videos/user/:userId (to fetch videos by specific user)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const videos = await Video.find({ uploader: userId })
      .populate('uploader', 'username')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user videos' });
  }
});

// GET /api/videos/featured (to fetch featured videos)
router.get('/featured', async (req, res) => {
  try {
    // For now, we'll use a simple approach - videos with most views
    // In production, you might want to add a 'featured' boolean field to the Video model
    const featuredVideos = await Video.find({ status: 'ready' })
      .populate('uploader', 'username')
      .sort({ views: -1, createdAt: -1 })
      .limit(6);
    
    res.json(featuredVideos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch featured videos' });
  }
});

// GET /api/videos/trending (to fetch trending videos)
router.get('/trending', async (req, res) => {
  try {
    // Trending logic: videos with high views in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendingVideos = await Video.find({ 
      status: 'ready',
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate('uploader', 'username')
      .sort({ views: -1, likes: -1, createdAt: -1 })
      .limit(8);
    
    res.json(trendingVideos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trending videos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id)
      .populate('uploader', 'username');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch video' });
  }
});

// DELETE /api/videos/:id (to delete a video)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if the user is the uploader
    if (video.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    await Video.findByIdAndDelete(id);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete video' });
  }
});

// POST /api/videos/test-process (manual test endpoint)
router.post('/test-process', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ message: 'Filename is required' });

    const inputPath = path.join('uploads', filename);
    const outputDir = path.join('uploads', 'processed', `test-${Date.now()}`);

    // Import the enhanced processor
    const { default: videoProcessorEnhanced } = await import('../services/videoProcessorEnhanced.js');
    
    const results = await videoProcessorEnhanced.testManualProcessing(inputPath, outputDir);
    res.status(200).json({ message: 'Manual processing test successful', results });
  } catch (error) {
    console.error('[VideoController] Manual processing test failed:', error);
    res.status(500).json({ message: 'Manual processing test failed', error: error.message });
  }
});

export default router;
