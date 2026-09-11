import http from './http';

export const getCart = () => http.get('/cart');
export const addToCart = (productId, quantity = 1) =>
  http.post('/cart/add', { productId, quantity });
export const removeFromCart = (productId) =>
  http.post('/cart/remove', { productId });
export const updateCartItem = (productId, quantity) =>
  http.post('/cart/update', { productId, quantity });
export const clearCart = () => http.post('/cart/clear');
