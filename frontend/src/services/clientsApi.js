import http from './http';

export const getClients = () => http.get('/clients');
export const updateClient = (id, data) => http.put(`/clients/${id}`, data);
