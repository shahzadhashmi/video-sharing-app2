import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Video from './models/Video.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/video-sharing-app');
    
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Video.deleteMany({});
    
    console.log('👤 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      password: hashedPassword
    });
    
    const user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: hashedPassword
    });
    
    console.log('🎬 Creating test videos...');
    await Video.create([
      {
        title: 'Amazing Nature Documentary',
        description: 'A beautiful documentary showcasing wildlife and nature',
        uploader: user1._id,
        status: 'ready',
        formats: { 
          mp4: 'uploads/processed/sample1/video.mp4', 
          webm: 'uploads/processed/sample1/video.webm' 
        },
        qualities: {
          '360p': 'uploads/processed/sample1/360p.mp4',
          '480p': 'uploads/processed/sample1/480p.mp4',
          '720p': 'uploads/processed/sample1/720p.mp4'
        },
        duration: 180,
        size: 52428800
      },
      {
        title: 'Tech Tutorial: React Basics',
        description: 'Learn the fundamentals of React.js in this comprehensive tutorial',
        uploader: user2._id,
        status: 'ready',
        formats: { 
          mp4: 'uploads/processed/sample2/video.mp4', 
          webm: 'uploads/processed/sample2/video.webm' 
        },
        qualities: {
          '360p': 'uploads/processed/sample2/360p.mp4',
          '480p': 'uploads/processed/sample2/480p.mp4',
          '720p': 'uploads/processed/sample2/720p.mp4'
        },
        duration: 900,
        size: 104857600
      },
      {
        title: 'Cooking Masterclass: Italian Pasta',
        description: 'Master the art of making authentic Italian pasta from scratch',
        uploader: user1._id,
        status: 'ready',
        formats: { 
          mp4: 'uploads/processed/sample3/video.mp4', 
          webm: 'uploads/processed/sample3/video.webm' 
        },
        qualities: {
          '360p': 'uploads/processed/sample3/360p.mp4',
          '480p': 'uploads/processed/sample3/480p.mp4',
          '720p': 'uploads/processed/sample3/720p.mp4'
        },
        duration: 1200,
        size: 157286400
      }
    ]);
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Test Data Summary:');
    console.log(`   - Users: 2 (testuser1, testuser2)`);
    console.log(`   - Videos: 3`);
    console.log(`   - Login: test1@example.com / password123`);
    console.log(`   - Login: test2@example.com / password123`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
