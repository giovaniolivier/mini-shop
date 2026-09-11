import http from './http';

export const login = (email, password, rememberMe = false) =>
  http.post('/auth/login', { email, password, rememberMe });

export const register = (data) =>
  http.post('/auth/register', data);

export const forgotPassword = (email) =>
  http.post('/auth/forgot-password', { email });
