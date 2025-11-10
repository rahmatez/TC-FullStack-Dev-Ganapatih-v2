import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/refresh`, {
              refreshToken,
            });

            const { token, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (username: string, password: string) =>
    api.post('/register', { username, password }),
  
  login: (username: string, password: string) =>
    api.post('/login', { username, password }),
  
  refresh: (refreshToken: string) =>
    api.post('/refresh', { refreshToken }),
};

// Posts API
export const postsAPI = {
  create: (content: string) =>
    api.post('/posts', { content }),
  
  getMyPosts: (page = 1, limit = 10) =>
    api.get(`/posts/my-posts?page=${page}&limit=${limit}`),
  
  getUserPosts: (username: string, page = 1, limit = 10) =>
    api.get(`/posts/user/${username}?page=${page}&limit=${limit}`),
  
  delete: (id: number) =>
    api.delete(`/posts/${id}`),
};

// Follow API
export const followAPI = {
  follow: (userId: number) =>
    api.post(`/follow/${userId}`),
  
  unfollow: (userId: number) =>
    api.delete(`/follow/${userId}`),
  
  getFollowers: (userId: number, page = 1, limit = 10) =>
    api.get(`/follow/${userId}/followers?page=${page}&limit=${limit}`),
  
  getFollowing: (userId: number, page = 1, limit = 10) =>
    api.get(`/follow/${userId}/following?page=${page}&limit=${limit}`),
  
  checkFollowStatus: (userId: number) =>
    api.get(`/follow/check/${userId}`),
};

// Feed API
export const feedAPI = {
  getFeed: (page = 1, limit = 10) =>
    api.get(`/feed?page=${page}&limit=${limit}`),
};

// Users API
export const usersAPI = {
  getAll: (page = 1, limit = 10, search = '') =>
    api.get(`/users?page=${page}&limit=${limit}&search=${search}`),
  
  getProfile: (username: string) =>
    api.get(`/users/${username}`),
  
  getMe: () =>
    api.get('/users/me/profile'),
};

export default api;
