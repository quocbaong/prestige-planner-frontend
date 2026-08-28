import api from '../lib/axios';

export const reviewService = {
  listReviewableEvents: () => api.get('/attendee/reviews/events'),
  list: () => api.get('/attendee/reviews'),
  submit: (data) => api.post('/attendee/reviews', data),
};
