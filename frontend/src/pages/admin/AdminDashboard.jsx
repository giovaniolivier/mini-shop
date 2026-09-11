import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', padding: '2rem 0 0 0', borderRadius: 10, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1 }}>Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
          <button onClick={() => navigate('/admin/products')} style={btnStyle}>Gérer les produits</button>
          <button onClick={() => navigate('/admin/orders')} style={btnStyle}>Gérer les commandes</button>
          <button onClick={() => navigate('/admin/clients')} style={btnStyle}>Gérer les clients</button>
          <button onClick={() => navigate('/admin/finances')} style={btnStyle}>Finances</button>
          <button onClick={() => navigate('/admin/analytics')} style={btnStyle}>Analytics</button>
          <button onClick={() => navigate('/admin/marketing')} style={btnStyle}>Marketing</button>
          <button onClick={() => navigate('/admin/settings')} style={btnStyle}>Paramètres</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, minHeight: 200 }}>
          <h3 style={{ color: '#1976d2', fontWeight: 800, fontSize: 24, marginBottom: 18 }}>Vue d'ensemble</h3>
          <p style={{ color: '#444', fontSize: 17 }}>Bienvenue sur l'espace administrateur. Utilisez les boutons ci-dessus pour accéder rapidement à la gestion des différentes sections de la boutique.</p>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '18px 32px',
  fontWeight: 700,
  fontSize: 18,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #e0e0e0',
  marginBottom: 12,
}; 