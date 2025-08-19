import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';

export class VideoProcessorEnhanced {
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
      console.log(`[VideoProcessor] Starting processing for video ${videoId}`);
      console.log(`[VideoProcessor] Input path: ${inputPath}`);
      console.log(`[VideoProcessor] Output directory: ${outputDir}`);

      // Verify input file exists
      try {
        await fs.access(inputPath);
        console.log(`[VideoProcessor] Input file verified: ${inputPath}`);
      } catch (error) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      const results = {
        original: null,
        webm: null,
        mp4: null,
        qualities: {}
      };

      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`[VideoProcessor] Output directory created/verified: ${outputDir}`);

      // Get video info for debugging
      const videoInfo = await this.getVideoInfo(inputPath);
      console.log(`[VideoProcessor] Video info:`, {
        duration: videoInfo.format.duration,
        size: videoInfo.format.size,
        format: videoInfo.format.format_name
      });

      // Generate web-optimized formats
      console.log(`[VideoProcessor] Converting to WebM...`);
      results.webm = await this.convertToWebM(inputPath, outputDir, videoId);
      console.log(`[VideoProcessor] WebM conversion complete: ${results.webm}`);

      console.log(`[VideoProcessor] Converting to MP4...`);
      results.mp4 = await this.convertToMP4(inputPath, outputDir, videoId);
      console.log(`[VideoProcessor] MP4 conversion complete: ${results.mp4}`);
      
      // Generate quality variants
      for (const [quality, settings] of Object.entries(this.qualitySettings)) {
        console.log(`[VideoProcessor] Generating ${quality} quality variant...`);
        results.qualities[quality] = await this.generateQualityVariant(
          results.mp4, 
          outputDir, 
          videoId, 
          quality, 
          settings
        );
        console.log(`[VideoProcessor] ${quality} quality complete: ${results.qualities[quality]}`);
      }

      console.log(`[VideoProcessor] Processing complete for video ${videoId}`);
      return results;
    } catch (error) {
      console.error(`[VideoProcessor] Processing failed for video ${videoId}:`, error);
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
          '-f webm',
          '-loglevel debug'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[FFmpeg] WebM conversion started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[FFmpeg] WebM progress: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log(`[FFmpeg] WebM conversion completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error(`[FFmpeg] WebM conversion failed:`, error);
          reject(error);
        })
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
          '-movflags +faststart',
          '-loglevel debug'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[FFmpeg] MP4 conversion started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[FFmpeg] MP4 progress: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log(`[FFmpeg] MP4 conversion completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error(`[FFmpeg] MP4 conversion failed:`, error);
          reject(error);
        })
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
          '-movflags +faststart',
          '-loglevel debug'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[FFmpeg] ${quality} quality started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[FFmpeg] ${quality} progress: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log(`[FFmpeg] ${quality} quality completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error(`[FFmpeg] ${quality} quality failed:`, error);
          reject(error);
        })
        .run();
    });
  }

  async getVideoInfo(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          console.error(`[FFprobe] Error getting video info:`, err);
          reject(err);
        } else {
          console.log(`[FFprobe] Video info retrieved successfully`);
          resolve(metadata);
        }
      });
    });
  }

  async cleanup(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
        console.log(`[Cleanup] Deleted file: ${file}`);
      } catch (error) {
        console.warn(`[Cleanup] Failed to delete file: ${file}`, error);
      }
    }
  }

  async testManualProcessing(inputPath, outputDir) {
    console.log(`[Manual Test] Testing manual processing...`);
    console.log(`[Manual Test] Input: ${inputPath}`);
    console.log(`[Manual Test] Output: ${outputDir}`);
    
    try {
      const testId = `test-${Date.now()}`;
      const result = await this.processVideo(inputPath, outputDir, testId);
      console.log(`[Manual Test] Success! Results:`, result);
      return result;
    } catch (error) {
      console.error(`[Manual Test] Failed:`, error);
      throw error;
    }
  }
}

export default new VideoProcessorEnhanced();
