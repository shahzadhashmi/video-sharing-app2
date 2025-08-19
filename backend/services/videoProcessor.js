import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';

export class VideoProcessor {
  constructor() {
    this.supportedFormats = ['mp4', 'webm', 'ogg'];
    this.qualitySettings = {
      '720p': { width: 1280, height: 720, bitrate: '2500k' },
      '480p': { width: 854, height: 480, bitrate: '1000k' },
      '360p': { width: 640, height: 360, bitrate: '500k' }
    };
  }

  async processVideo(inputPath, outputDir, videoId) {
    try {
      const results = {
        original: null,
        webm: null,
        mp4: null,
        qualities: {}
      };

      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Generate web-optimized formats
      results.webm = await this.convertToWebM(inputPath, outputDir, videoId);
      results.mp4 = await this.convertToMP4(inputPath, outputDir, videoId);
      
      // Generate quality variants
      for (const [quality, settings] of Object.entries(this.qualitySettings)) {
        results.qualities[quality] = await this.generateQualityVariant(
          results.mp4, 
          outputDir, 
          videoId, 
          quality, 
          settings
        );
      }

      return results;
    } catch (error) {
      throw new Error(`Video processing failed: ${error.message}`);
    }
  }

  async convertToWebM(inputPath, outputDir, videoId) {
    const outputPath = path.join(outputDir, `${videoId}-webm.webm`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libvpx-vp9',
          '-c:a libopus',
          '-b:v 2000k',
          '-b:a 128k',
          '-f webm'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async convertToMP4(inputPath, outputDir, videoId) {
    const outputPath = path.join(outputDir, `${videoId}-h264.mp4`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:v 2500k',
          '-b:a 128k',
          '-preset fast',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async generateQualityVariant(inputPath, outputDir, videoId, quality, settings) {
    const outputPath = path.join(outputDir, `${videoId}-${quality}.mp4`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${settings.width}x${settings.height}`)
        .videoBitrate(settings.bitrate)
        .outputOptions([
          '-preset fast',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async getVideoInfo(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  async cleanup(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.warn(`Failed to delete file: ${file}`, error);
      }
    }
  }
}

export default new VideoProcessor();
