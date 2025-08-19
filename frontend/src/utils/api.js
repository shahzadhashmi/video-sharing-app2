// API utility file that re-exports from the correct service modules
// This file provides backward compatibility for components expecting ../utils/api

import { authService } from '../services/apiService.js';
import { videoService } from '../services/apiService.js';

// Export the services as API objects for backward compatibility
export const authAPI = {
  login: authService.login,
  signup: authService.register,
};

export const videoAPI = {
  uploadVideo: videoService.uploadVideo,
  getAllVideos: videoService.getAllVideos,
  getVideoById: videoService.getVideoById,
  searchVideos: videoService.searchVideos,
  likeVideo: videoService.likeVideo,
  addView: videoService.addView,
};

// Default export for compatibility
export default {
  authAPI,
  videoAPI,
};
