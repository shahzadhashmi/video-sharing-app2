const API_CONFIG = {
  BASE_URL: "https://video-sharing-app2-b5ema7dmc5g5g5hw.uksouth-01.azurewebsites.net/api",

  ENDPOINTS: {
    VIDEOS: {
      ALL: "/videos",
      FEATURED: "/videos/featured",
      TRENDING: "/videos/trending",
      BY_ID: (id) => `/videos/${id}`,
      SEARCH: (query) => `/videos/search?q=${encodeURIComponent(query)}`,
      UPLOAD: "/videos/upload",
      LIKE: (id) => `/videos/${id}/like`,
      VIEW: (id) => `/videos/${id}/view`,
    },
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/signup",
      LOGOUT: "/auth/logout",
    },
    USERS: {
      PROFILE: (username) => `/users/${username}`,
      UPDATE_PROFILE: "/users/me",
    },
    COMMENTS: {
      CREATE: "/comments",
      DELETE: (id) => `/comments/${id}`,
    },
  },
};

export default API_CONFIG;
