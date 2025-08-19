import axios from 'axios';
import API_CONFIG from '../config/api.js';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Video API service
export const videoService = {
  // Get all videos
  getAllVideos: async (params = {}) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.ALL, { params });
    return response.data;
  },

  // Get featured videos
  getFeaturedVideos: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.FEATURED);
    return response.data;
  },

  // Get trending videos
  getTrendingVideos: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.TRENDING);
    return response.data;
  },

  // Get video by ID
  getVideoById: async (id) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.BY_ID(id));
    return response.data;
  },

  // Search videos
  searchVideos: async (query) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.SEARCH(query));
    return response.data;
  },

  // Upload video
  uploadVideo: async (formData) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update video
  updateVideo: async (id, data) => {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.VIDEOS.UPDATE(id), data);
    return response.data;
  },

  // Delete video
  deleteVideo: async (id) => {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.VIDEOS.DELETE(id));
    return response.data;
  },

  // Like video
  likeVideo: async (id) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.LIKE(id));
    return response.data;
  },

  // Add view
  addView: async (id) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.VIEW(id));
    return response.data;
  },
};

// Auth API service
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
    return response.data;
  },
};

export default apiClient;
