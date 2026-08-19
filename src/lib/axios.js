import axios from 'axios';

const configuredGatewayUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const gatewayUrl = configuredGatewayUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

const api = axios.create({
  baseURL: `${gatewayUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true,
});

const publicAuthPaths = [
  '/auth/login', '/auth/register', '/auth/refresh', '/auth/verify-otp',
  '/auth/resend-otp', '/auth/forgot-password', '/auth/verify-reset-otp', '/auth/reset-password',
];

let refreshPromise = null;

export const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const requestUrl = config.url || '';
    const isPublicAuthRequest = publicAuthPaths.some((path) => requestUrl.includes(path));
    // Public authentication flows must reach Auth even when local storage contains an expired token.
    if (token && !config.skipAuthRefresh && !isPublicAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Correlation-Id'] = crypto.randomUUID();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const correlationId = error.response?.headers?.['x-correlation-id'];
    if (correlationId) error.correlationId = correlationId;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        refreshPromise ||= api.post('/auth/refresh', { refreshToken }, { skipAuthRefresh: true });
        const response = await refreshPromise;
        refreshPromise = null;
        const { accessToken, refreshToken: nextRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        if (nextRefreshToken) localStorage.setItem('refreshToken', nextRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        refreshPromise = null;
        clearSession();
        if (window.location.pathname !== '/login') window.location.assign('/login');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
