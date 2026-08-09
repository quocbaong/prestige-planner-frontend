import api from './api';

export const timelineService = {
  getTimelines: (eventId) => api.get(`/organizer/events/${eventId}/timelines`),
  createTimeline: (eventId, data) => api.post(`/organizer/events/${eventId}/timelines`, data),
  updateTimeline: (eventId, id, data) => api.put(`/organizer/events/${eventId}/timelines/${id}`, data),
  deleteTimeline: (eventId, id) => api.delete(`/organizer/events/${eventId}/timelines/${id}`),
};
