/**
 * APIs mock / non branchées au backend.
 * Settings & analytics restent des stubs.
 * Clients : préférer `services/clientsApi.js` (GET/PUT /clients).
 */
import http from './http';

export { getClients, updateClient } from './clientsApi';
export const deleteClient = (id) => http.delete(`/clients/${id}`);

export const getSettings = () => http.get('/settings');
export const updateSettings = (data) => http.put('/settings', data);

export const getAnalytics = () => http.get('/analytics');

export const updateOrder = (id, data) => http.put(`/orders/${id}`, data);
export const deleteOrder = (id) => http.delete(`/orders/${id}`);
