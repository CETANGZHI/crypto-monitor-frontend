import axios from 'axios';

const API_BASE_URL = 'https://p9hwiqcnjm61.manus.space/api/v1'; // 后端API地址

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：在发送请求前添加JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理Token过期和刷新
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 如果是401错误且不是刷新Token的请求
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 刷新Token失败，清除所有Token并重定向到登录页
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // 这里可以添加重定向到登录页的逻辑，例如使用React Router的history.push
          console.error('Refresh token failed:', refreshError);
          window.location.href = '/login'; // 简单重定向
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  autoRegister: (deviceData) => api.post('/auth/auto-register', deviceData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  sendVerificationCode: (emailData) => api.post('/auth/send_verification_code', emailData), // 新增
};

export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),
  setPassword: (newPassword) => api.post('/users/set-password', { new_password: newPassword }),
  getSubscriptionStatus: () => api.get('/users/subscription-status'),
  deleteAccount: () => api.delete('/users/account'),
  getUsageStats: () => api.get('/users/usage-stats'),
};

// 其他模块的API占位符
export const twitter = {
  getAccounts: () => api.get('/twitter/accounts'),
  // ... 其他推特相关API
};

export const wallet = {
  getAddresses: () => api.get('/wallet/addresses'),
  // ... 其他钱包相关API
};

export const blackrock = {
  getHoldings: () => api.get('/blackrock/holdings'),
  // ... 其他贝莱德相关API
};

export const notifications = {
  getNotifications: () => api.get('/notifications/list'),
  // ... 其他通知相关API
};

// OAuth认证相关API
export const oauth = {
  // Google OAuth登录
  googleLogin: (data) => api.post('/oauth/google/login', data),
  
  // Apple OAuth登录
  appleLogin: (data) => api.post('/oauth/apple/login', data),
  
  // 获取Google授权URL
  getGoogleAuthUrl: () => api.get('/oauth/google/authorize'),
  
  // 获取Apple授权URL
  getAppleAuthUrl: () => api.get('/oauth/apple/authorize'),
  
  // Google OAuth回调
  googleCallback: (data) => api.post('/oauth/google/callback', data),
};

export { api };
export default api;


