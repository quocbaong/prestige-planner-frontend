import axios from 'axios';

const configuredGatewayUrl = import.meta.env.VITE_API_URL?.trim();
if (!configuredGatewayUrl) {
  throw new Error('VITE_API_URL must be configured with the Gateway base URL');
}
const gatewayUrl = configuredGatewayUrl.replace(/\/+$/, '');
const gatewayBaseUrl = gatewayUrl.endsWith('/api/v1') ? gatewayUrl : `${gatewayUrl}/api/v1`;

const api = axios.create({
  baseURL: gatewayBaseUrl,
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

const createCorrelationId = () => (
  typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `pp-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const getCorrelationId = (response) => (
  response?.headers?.['x-correlation-id']
  || response?.headers?.['X-Correlation-Id']
  || response?.config?.headers?.['X-Correlation-Id']
);

const normalizeError = (error) => {
  const responseData = error.response?.data;
  const normalized = {
    status: error.response?.status || error.status || 0,
    code: responseData?.code || responseData?.errorCode || error.code || 'REQUEST_FAILED',
    message: responseData?.message || responseData?.error || error.message || 'Request failed',
    correlationId: getCorrelationId(error.response) || error.correlationId || null,
    details: responseData?.details || responseData,
  };
  normalized.error = normalized.message;
  error.correlationId = normalized.correlationId;
  error.apiError = normalized;
  if (error.response) error.response.data = normalized;
  return error;
};

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
    config.headers['X-Correlation-Id'] = config.headers['X-Correlation-Id'] || createCorrelationId();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const correlationId = getCorrelationId(error.response);
    if (correlationId) error.correlationId = correlationId;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        refreshPromise ||= api.post('/auth/refresh', { refreshToken }, { skipAuthRefresh: true })
          .finally(() => { refreshPromise = null; });
        const response = await refreshPromise;
        const { accessToken, refreshToken: nextRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        if (nextRefreshToken) localStorage.setItem('refreshToken', nextRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        clearSession();
        if (window.location.pathname !== '/login') window.location.assign('/login');
        return Promise.reject(normalizeError(err));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
