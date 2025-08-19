# Video Processing Troubleshooting Guide

## Overview
This guide provides comprehensive steps to troubleshoot and resolve video processing failures in the video-sharing application.

## Changes Made

### 1. Enhanced Video Processor (`videoProcessorEnhanced.js`)
- **Comprehensive error handling** with detailed logging
- **Debug logging** at every step of the processing pipeline
- **Input validation** to ensure files exist before processing
- **Progress tracking** for FFmpeg operations
- **Manual test endpoint** for troubleshooting

### 2. Updated Video Controller (`videoController.js`)
- **Automatic video processing** after upload
- **Asynchronous processing** to prevent blocking the upload response
- **Test endpoint** for manual processing verification
- **Detailed error logging** for debugging

### 3. New Features Added

#### Manual Test Endpoint
```http
POST /api/videos/test-process
Content-Type: application/json

{
  "filename": "your-video-file.mp4"
}
```

## Troubleshooting Steps

### 1. Check Backend Logs
```bash
# Run backend with debug logging
npm run dev
# or
node backend/index.js
```

Look for:
- `[VideoProcessor]` logs during processing
- `[FFmpeg]` logs for FFmpeg operations
- `[VideoController]` logs for upload and processing

### 2. Verify File Paths
- Ensure uploaded files exist in `backend/uploads/`
- Check processed files in `backend/uploads/processed/`

### 3. Manual Testing
Use the test endpoint:
```bash
curl -X POST http://localhost:5000/api/videos/test-process \
  -H "Content-Type: application/json" \
  -d '{"filename": "test-video.mp4"}'
```

### 4. Common Issues and Solutions

#### Issue: "Input file not found"
**Solution**: Check if the uploaded file exists in the uploads directory

#### Issue: FFmpeg errors
**Solution**: 
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check FFmpeg logs in console output
- Verify file format compatibility

#### Issue: Processing hangs
**Solution**: 
- Check for large file sizes
- Monitor memory usage
- Look for FFmpeg progress logs

### 5. Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=1 npm run dev
```

### 6. Testing Checklist

- [ ] FFmpeg is installed and accessible
- [ ] Upload directory exists and is writable
- [ ] Processed directory exists and is writable
- [ ] Video files are in supported formats (mp4, webm, ogg)
- [ ] Backend has sufficient memory for processing
- [ ] Network connectivity for file uploads

### 7. Performance Monitoring

Monitor these metrics:
- Processing time per video
- Memory usage during processing
- Disk space usage
- Error rates

### 8. Error Recovery

If processing fails:
1. Check logs for specific error messages
2. Verify file integrity
3. Retry processing with manual test endpoint
4. Check system resources (disk space, memory)

## Quick Start for Testing

1. **Upload a video** via the upload endpoint
2. **Check logs** for processing status
3. **Use test endpoint** for manual testing
4. **Verify processed files** in the processed directory

## Support

For additional support:
1. Check the application logs
2. Use the manual test endpoint
3. Review the troubleshooting steps above
4. Ensure all dependencies are properly installed
