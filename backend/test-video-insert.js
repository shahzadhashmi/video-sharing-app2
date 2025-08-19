// MongoDB script to insert a test video document for testing video playback
// Run this with: node test-video-insert.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from './models/Video.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/video-sharing-app';

const testVideo = {
  title: "Test Video - Video Sharing App",
  description: "This is a test video to verify video playback functionality in the video sharing app.",
  filePath: "uploads/1754712077229-test.mp4", // Using existing test file
  thumbnail: "uploads/thumbnails/test-thumbnail.jpg",
  originalUrl: "uploads/1754712077229-test.mp4",
  formats: {
    mp4: "uploads/1754712077229-test.mp4",
    webm: "uploads/1754712077229-test.webm",
    h264: "uploads/1754712077229-test.mp4"
  },
  qualities: {
    '360p': "uploads/1754712077229-test.mp4",
    '480p': "uploads/1754712077229-test.mp4",
    '720p': "uploads/1754712077229-test.mp4",
    '1080p': "uploads/1754712077229-test.mp4"
  },
  duration: 30,
  size: 5242880,
  views: 0,
  likes: 0,
  status: "ready",
  uploader: null, // Will be set to a test user if available
  creator: {
    _id: new mongoose.Types.ObjectId(),
    username: "test-creator"
  }
};

async function insertTestVideo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test video already exists
    const existingVideo = await Video.findOne({ title: testVideo.title });
    if (existingVideo) {
      console.log('ℹ️ Test video already exists:', existingVideo._id);
      console.log('🔗 Test video URL:', `http://localhost:5173/video/${existingVideo._id}`);
      return;
    }

    // Insert test video
    const video = new Video(testVideo);
    const savedVideo = await video.save();
    
    console.log('✅ Test video inserted successfully!');
    console.log('📋 Video ID:', savedVideo._id);
    console.log('🔗 Direct video URL:', `http://localhost:5000/${savedVideo.filePath}`);
    console.log('🔗 Frontend URL:', `http://localhost:5173/video/${savedVideo._id}`);
    console.log('🔗 API endpoint:', `http://localhost:5000/api/videos/${savedVideo._id}`);

  } catch (error) {
    console.error('❌ Error inserting test video:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

insertTestVideo();
