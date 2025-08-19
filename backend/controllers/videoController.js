import Video from '../models/Video.js';
import path from 'path';
import videoProcessor from '../services/videoProcessorEnhanced.js';

export const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // Build correct file paths
    const originalPath = path.join('uploads', file.filename);
    const processedDir = path.join('uploads', 'processed');
    
    const video = new Video({
      title,
      description,
      originalUrl: originalPath,
      filePath: path.join(processedDir, 'placeholder.mp4'), // Will be updated after processing
      uploader: req.user?.id || null,
      creator: {
        _id: req.user?.id || null,
        username: req.user?.username || 'anonymous'
      }
    });

    await video.save();

    // Start video processing asynchronously
    const inputPath = path.join('backend', 'uploads', file.filename);
    const outputDir = path.join('backend', 'uploads', 'processed', video._id.toString());

    videoProcessor.processVideo(inputPath, outputDir, video._id.toString())
      .then(results => {
        console.log(`[VideoController] Video processing completed for video ${video._id}`);
        
        // Update video with correct file paths
        const updateData = {
          filePath: path.join('uploads', 'processed', video._id.toString(), '720p.mp4'),
          thumbnail: path.join('uploads', 'processed', video._id.toString(), 'thumbnail.jpg'),
          status: 'ready'
        };
        
        // Add available qualities
        if (results.qualities) {
          updateData.qualities = results.qualities;
        }
        
        Video.findByIdAndUpdate(video._id, updateData).exec();
      })
      .catch(error => {
        console.error(`[VideoController] Video processing failed for video ${video._id}:`, error);
        Video.findByIdAndUpdate(video._id, { status: 'failed' }).exec();
      });

    res.status(201).json({ 
      message: 'Video uploaded successfully', 
      video,
      filePath: path.join('uploads', 'processed', video._id.toString(), '720p.mp4')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// Get video with correct file paths
export const getVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id).populate('uploader', 'username');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Ensure filePath exists and is accessible
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL 
      : 'http://localhost:5000';
    
    const videoUrl = `${baseUrl}/${video.filePath}`;
    const thumbnailUrl = video.thumbnail ? `${baseUrl}/${video.thumbnail}` : null;

    res.json({
      ...video.toObject(),
      filePath: videoUrl,
      thumbnail: thumbnailUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving video' });
  }
};

// List videos with correct paths
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ status: 'ready' })
      .populate('uploader', 'username')
      .sort({ createdAt: -1 });

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL 
      : 'http://localhost:5000';

    const videosWithPaths = videos.map(video => ({
      ...video.toObject(),
      filePath: `${baseUrl}/${video.filePath}`,
      thumbnail: video.thumbnail ? `${baseUrl}/${video.thumbnail}` : null
    }));

    res.json(videosWithPaths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving videos' });
  }
};
