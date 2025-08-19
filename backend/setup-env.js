import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envExample = `# Video Sharing App Environment Variables

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/video-sharing-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB

# CORS Configuration
FRONTEND_URL=http://localhost:5173
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the .env file with your actual configuration values');
} else {
  console.log('ℹ️  .env file already exists');
}

// Check if required directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(uploadsDir, 'processed');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ uploads directory created');
}

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
  console.log('✅ uploads/processed directory created');
}

console.log('🚀 Environment setup complete!');
