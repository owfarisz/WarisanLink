import api from './axios';

export const compassApi = {
  getByDestinationSlug: (slug) => api.get(`/compass/${slug}`),
};

export const weatherApi = {
  getCurrent: (lat, lon) => api.get('/weather/current', { params: { lat, lon } }),
};

export const routingApi = {
  getDistance: (fromLat, fromLon, toLat, toLon) =>
    api.get('/routing/distance', { params: { fromLat, fromLon, toLat, toLon } }),
};

export const geocodingApi = {
  reverse: (lat, lon) => api.get('/geocoding/reverse', { params: { lat, lon } }),
  search: (q) => api.get('/geocoding/search', { params: { q } }),
};

export const historyApi = {
  track: (sessionId, destinationId) => api.post('/history/track', { sessionId, destinationId }),
  get: (sessionId, limit = 20) => api.get(`/history/${sessionId}`, { params: { limit } }),
};
