import api from './api';
export const registrationService = {
  register: (eventId, data) => api.post(`/events/${eventId}/registrations/register`, data),
  confirmRegistration: (eventId, id) => api.post(`/events/${eventId}/registrations/${id}/confirm`),
  getRegistrations: (eventId) => api.get(`/organizer/events/${eventId}/registrations`),
  getRegistrationDetail: (eventId, id) => api.get(`/organizer/events/${eventId}/registrations/${id}`),
  getMyRegistrations: () => api.get('/attendee/registrations'),
};
