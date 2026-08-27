import api, { clearSession } from '../lib/axios';

export { clearSession };

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', null, { params: { email } }),
  forgotPassword: (email) => api.post('/auth/forgot-password', null, { params: { email } }),
  verifyResetOtp: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
