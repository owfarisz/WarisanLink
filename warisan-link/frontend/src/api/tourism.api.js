import api from './axios';

export const destinationsApi = {
  list: (params) => api.get('/destinations', { params }),
  getBySlug: (slug) => api.get(`/destinations/${slug}`),
};

export const tourismApi = {
  list: (params) => api.get('/tourism/tourism', { params }),
  nearby: (params) => api.get('/tourism/tourism/nearby', { params }),
  countries: () => api.get('/tourism/tourism/countries'),
  provinces: (country) => api.get('/tourism/tourism/provinces', { params: { country } }),
  categories: () => api.get('/tourism/tourism/categories'),
};
