// API Configuration
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
      REGISTER: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USERS: {
      PROFILE: (username) => `/users/${username}`,
      UPDATE_PROFILE: '/users/me',
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
