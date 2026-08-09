import api from './api';

export const venueService = {
  getVenues: () => api.get('/organizer/venues'),
  createVenue: (data) => api.post('/organizer/venues', data),
  updateVenue: (id, data) => api.put(`/organizer/venues/${id}`, data),
  deleteVenue: (id) => api.delete(`/organizer/venues/${id}`),
};
