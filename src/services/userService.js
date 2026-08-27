import api from '../lib/axios';

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
};
