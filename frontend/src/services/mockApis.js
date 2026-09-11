/**
 * APIs mock / non branchées au backend.
 * Les pages admin clients, settings, analytics et mutations de commandes
 * s'appuient encore sur du localStorage ou des stubs — pas d'endpoints réels.
 */
import http from './http';

export const getClients = () => http.get('/clients');
export const updateClient = (id, data) => http.put(`/clients/${id}`, data);
export const deleteClient = (id) => http.delete(`/clients/${id}`);

export const getSettings = () => http.get('/settings');
export const updateSettings = (data) => http.put('/settings', data);

export const getAnalytics = () => http.get('/analytics');

export const updateOrder = (id, data) => http.put(`/orders/${id}`, data);
export const deleteOrder = (id) => http.delete(`/orders/${id}`);
