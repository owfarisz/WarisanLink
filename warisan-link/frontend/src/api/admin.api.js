import api from './axios';

export const categoriesApi = {
  list: () => api.get('/categories'),
};
