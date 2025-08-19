/**
 * Utility functions for handling video URLs with cache-busting
 */

/**
 * Adds cache-busting query parameter to video URL
 * @param {string} videoUrl - The original video URL
 * @param {string|number} version - Optional version parameter (defaults to timestamp)
 * @returns {string} - Video URL with cache-busting parameter
 */
export const getCacheBustedVideoUrl = (videoUrl, version = null) => {
  if (!videoUrl) return '';
  
  // If URL already has query parameters, append the cache buster
  const separator = videoUrl.includes('?') ? '&' : '?';
  const cacheBuster = version || Date.now();
  
  return `${videoUrl}${separator}v=${cacheBuster}`;
};

/**
 * Gets video URL with cache-busting for real-time updates
 * @param {Object} video - Video object containing url or formats
 * @returns {string} - Cache-busted video URL
 */
export const getVideoUrlWithCacheBust = (video) => {
  if (!video) return '';
  
  // Prefer processed MP4 format if available, fallback to original URL
  const baseUrl = video.formats?.mp4 || video.url;
  return getCacheBustedVideoUrl(baseUrl);
};

/**
 * Gets thumbnail URL with cache-busting
 * @param {string} thumbnailUrl - Original thumbnail URL
 * @returns {string} - Cache-busted thumbnail URL
 */
export const getCacheBustedThumbnailUrl = (thumbnailUrl) => {
  if (!thumbnailUrl || thumbnailUrl.includes('/api/placeholder/')) {
    return thumbnailUrl; // Don't cache-bust placeholder images
  }
  
  return getCacheBustedVideoUrl(thumbnailUrl);
};
