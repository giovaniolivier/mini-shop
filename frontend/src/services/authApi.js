import http from './http';

export const login = (email, password) =>
  http.post('/auth/login', { email, password });

export const register = (data) =>
  http.post('/auth/register', data);
