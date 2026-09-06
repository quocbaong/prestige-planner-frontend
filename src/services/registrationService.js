import api from '../lib/axios';
export const registrationService = {
  register: (eventId, data, idempotencyKey) => api.post(
    `/events/${eventId}/registrations/register`,
    data,
    {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    }
  ),
  confirmRegistration: (eventId, id) => api.post(`/events/${eventId}/registrations/${id}/confirm`),
  cancelRegistration: (eventId, id) => api.post(`/events/${eventId}/registrations/${id}/cancel`),
  getRegistrations: (eventId) => api.get(`/organizer/events/${eventId}/registrations`),
  getRegistrationDetail: (eventId, id) => api.get(`/organizer/events/${eventId}/registrations/${id}`),
  getMyRegistrations: () => api.get('/attendee/registrations'),
};
