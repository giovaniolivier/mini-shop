import http from './http';

export const getProducts = () => http.get('/products');
export const createProduct = (data) => http.post('/products', data);
export const updateProduct = (id, data) => http.put(`/products/${id}`, data);
export const deleteProduct = (id) => http.delete(`/products/${id}`);
