import axios from "axios";
import API_CONFIG from "../config/api.js";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Add token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle unauthorized
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Video API
export const videoService = {
  getAll: () => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.ALL).then(r => r.data),
  getFeatured: () => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.FEATURED).then(r => r.data),
  getTrending: () => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.TRENDING).then(r => r.data),
  getById: (id) => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.BY_ID(id)).then(r => r.data),
  search: (q) => apiClient.get(API_CONFIG.ENDPOINTS.VIDEOS.SEARCH(q)).then(r => r.data),
  upload: (formData) =>
    apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data),
  like: (id) => apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.LIKE(id)).then(r => r.data),
  addView: (id) => apiClient.post(API_CONFIG.ENDPOINTS.VIDEOS.VIEW(id)).then(r => r.data),
};

// Auth API
export const authService = {
  login: (data) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data).then(r => r.data),
  register: (data) => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data).then(r => r.data),
  logout: () => apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).then(r => r.data),
  getProfile: (username) => apiClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE(username)).then(r => r.data),
  updateProfile: (data) => apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, data).then(r => r.data),
};

// Comments API
export const commentService = {
  add: (data) => apiClient.post(API_CONFIG.ENDPOINTS.COMMENTS.CREATE, data).then(r => r.data),
  remove: (id) => apiClient.delete(API_CONFIG.ENDPOINTS.COMMENTS.DELETE(id)).then(r => r.data),
};

export default apiClient;
