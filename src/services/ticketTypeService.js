import api from './api';

export const ticketTypeService = {
  getTicketTypes: (eventId) => api.get(`/organizer/events/${eventId}/ticket-types`),
  createTicketType: (eventId, data) => api.post(`/organizer/events/${eventId}/ticket-types`, data),
  updateTicketType: (eventId, id, data) => api.put(`/organizer/events/${eventId}/ticket-types/${id}`, data),
  deleteTicketType: (eventId, id) => api.delete(`/organizer/events/${eventId}/ticket-types/${id}`),
};
