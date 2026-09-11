import http from './http';

export const getOrders = () => http.get('/orders');
export const getClientOrders = () => http.get('/client/orders');
export const createOrder = (items) => http.post('/orders', { items });
export const createManualOrder = (data) => http.post('/orders/manual', data);
export const updateOrder = (id, data) => http.put(`/orders/${id}`, data);
export const getStats = () => http.get('/stats');
