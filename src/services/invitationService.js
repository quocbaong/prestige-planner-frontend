import api from './api';
export const invitationService = {
  getInvitations: (eventId) => api.get(`/organizer/events/${eventId}/invitations`),
  createInvitations: (eventId, data) => api.post(`/organizer/events/${eventId}/invitations`, data),
  acceptInvitation: (token) => api.get(`/invitations/${token}/accept`),
};
