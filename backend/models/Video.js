import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  filePath: { type: String, required: true }, // Main video file path
  thumbnail: String, // Thumbnail image path
  originalUrl: String, // Original uploaded file path
  formats: {
    mp4: String,
    webm: String,
    h264: String
  },
  qualities: {
    '360p': String,
    '480p': String,
    '720p': String,
    '1080p': String
  },
  duration: Number,
  size: Number,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String
  }
}, { timestamps: true });

export default mongoose.model('Video', videoSchema);
