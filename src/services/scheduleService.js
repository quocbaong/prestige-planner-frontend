import api from './api';

export const scheduleService = {
  getSchedules: (eventId) => api.get(`/organizer/events/${eventId}/schedules`),
  createSchedule: (eventId, data) => api.post(`/organizer/events/${eventId}/schedules`, data),
  updateSchedule: (eventId, id, data) => api.put(`/organizer/events/${eventId}/schedules/${id}`, data),
  deleteSchedule: (eventId, id) => api.delete(`/organizer/events/${eventId}/schedules/${id}`),
};
