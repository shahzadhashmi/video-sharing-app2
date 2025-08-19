import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function installDependencies() {
  try {
    console.log('Installing video processing dependencies...');
    
    // Install fluent-ffmpeg for video processing
    await execAsync('npm install fluent-ffmpeg');
    
    // Install ffmpeg-static for cross-platform ffmpeg binaries
    await execAsync('npm install ffmpeg-static');
    
    console.log('Dependencies installed successfully!');
    console.log('Note: Make sure FFmpeg is installed on your system for video processing to work.');
    console.log('On Windows: Download from https://ffmpeg.org/download.html');
    console.log('On macOS: brew install ffmpeg');
    console.log('On Linux: sudo apt-get install ffmpeg');
    
  } catch (error) {
    console.error('Error installing dependencies:', error);
  }
}

installDependencies();
