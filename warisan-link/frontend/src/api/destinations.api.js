import api from './axios';

export const destinationsApi = {
  list: (params) => api.get('/destinations', { params }),
  getBySlug: (slug) => api.get(`/destinations/${slug}`),
};
