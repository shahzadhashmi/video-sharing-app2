// API Configuration for the new API service
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    VIDEOS: {
      ALL: '/videos',
      FEATURED: '/videos/featured',
      TRENDING: '/videos/trending',
      BY_ID: (id) => `/videos/${id}`,
      SEARCH: (query) => `/videos/search?q=${encodeURIComponent(query)}`,
      BY_CATEGORY: (category) => `/videos/category/${category}`,
      UPLOAD: '/videos/upload',
      UPDATE: (id) => `/videos/${id}`,
      DELETE: (id) => `/videos/${id}`,
      LIKE: (id) => `/videos/${id}/like`,
      VIEW: (id) => `/videos/${id}/view`,
      COMMENTS: (id) => `/videos/${id}/comments`
    },
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
      UPDATE_PROFILE: '/auth/profile/update'
    },
    USERS: {
      PROFILE: (username) => `/users/${username}`,
      VIDEOS: (username) => `/users/${username}/videos`,
      SUBSCRIPTIONS: '/users/subscriptions',
      SUBSCRIBE: (userId) => `/users/${userId}/subscribe`,
      UNSUBSCRIBE: (userId) => `/users/${userId}/unsubscribe`
    },
    COMMENTS: {
      CREATE: '/comments',
      UPDATE: (id) => `/comments/${id}`,
      DELETE: (id) => `/comments/${id}`,
      LIKE: (id) => `/comments/${id}/like`
    }
  }
};

export default API_CONFIG;
