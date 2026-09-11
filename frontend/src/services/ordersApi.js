import http from './http';

export const getOrders = () => http.get('/orders');
export const getClientOrders = () => http.get('/client/orders');
export const createOrder = (items) => http.post('/orders', { items });
export const getStats = () => http.get('/stats');
