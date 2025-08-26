import axios from 'axios';
import API_CONFIG from './../config/api.js';

// Axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unauthorized access
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Video API service
export const videoService = {
  getAllVideos: (params = {}) => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.ALL, { params }).then(res => res.data),
  getFeaturedVideos: () => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.FEATURED).then(res => res.data),
  getTrendingVideos: () => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.TRENDING).then(res => res.data),
  getVideoById: (id) => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.BY_ID(id)).then(res => res.data),
  searchVideos: (query) => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.SEARCH(query)).then(res => res.data),
  uploadVideo: (formData) => apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  updateVideo: (id, data) => apiClient.put(API_CONFIG.ENDPOINTS.VIDEOS.UPDATE(id), data).then(res => res.data),
  deleteVideo: (id) => apiClient.delete(API_CONFIG.ENDPOINTS.VIDEOS.DELETE(id)).then(res => res.data),
  likeVideo: (id) => apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.LIKE(id)).then(res => res.data),
  addView: (id) => apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.VIEW(id)).then(res => res.data),
};

// Auth API service
export const authService = {
  login: (credentials) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials).then(res => res.data),
  register: (userData) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData).then(res => res.data),
  logout: () => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).then(res => res.data),
  getProfile: (username) => apiClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE(username)).then(res => res.data),
  updateProfile: (userData) => apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, userData).then(res => res.data),
};

export default apiClient;
