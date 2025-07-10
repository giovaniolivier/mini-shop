import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getProducts = () => axios.get(`${API_BASE}/products`);
export const createProduct = (data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_BASE}/products`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateProduct = (id, data) => {
  const token = localStorage.getItem('token');
  return axios.put(`${API_BASE}/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const deleteProduct = (id) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${API_BASE}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Commandes
export const getOrders = () => axios.get(`${API_BASE}/orders`);
export const updateOrder = (id, data) => axios.put(`${API_BASE}/orders/${id}`, data);
export const deleteOrder = (id) => axios.delete(`${API_BASE}/orders/${id}`);

// Clients
export const getClients = () => axios.get(`${API_BASE}/clients`);
export const updateClient = (id, data) => axios.put(`${API_BASE}/clients/${id}`, data);
export const deleteClient = (id) => axios.delete(`${API_BASE}/clients/${id}`);

// Settings
export const getSettings = () => axios.get(`${API_BASE}/settings`);
export const updateSettings = (data) => axios.put(`${API_BASE}/settings`, data);

// Analytics
export const getAnalytics = () => axios.get(`${API_BASE}/analytics`);

// Ajoute d'autres méthodes pour commandes, clients, etc. selon besoin. 