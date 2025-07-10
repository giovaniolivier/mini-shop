import React, { useEffect, useState } from 'react';
import axios from 'axios';

const badgeStyle = {
  background: 'linear-gradient(90deg, #ffd700 0%, #fffbe0 100%)',
  color: '#bfa100',
  borderRadius: 12,
  padding: '4px 16px',
  fontWeight: 700,
  fontSize: 15,
  marginLeft: 16,
  boxShadow: '0 2px 8px #f5e9a0',
  display: 'inline-block',
};

const avatarStyle = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  objectFit: 'cover',
  boxShadow: '0 2px 8px #e0e0e0',
  marginRight: 24,
  background: '#e3f2fd',
  border: '2px solid #1976d2',
};

export default function ClientDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur","email":"demo@mail.com"}'));

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/client/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des commandes');
        setLoading(false);
      });
  }, []);

  // Avatar par défaut (initiale du prénom)
  const avatarUrl = user.avatarUrl || null;
  const initial = (user.name || user.username || 'U').charAt(0).toUpperCase();
  const badge = 'Client Or'; // Statut simulé
  const prenom = (user.name || user.username || '').split(' ')[0] || 'Client';

  return (
    <div style={{ background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', padding: '2rem 0 0 0', borderRadius: 10, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
        {/* En-tête moderne */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={avatarStyle} />
          ) : (
            <div style={{ ...avatarStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#1976d2' }}>{initial}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1976d2', letterSpacing: 1, marginBottom: 4 }}>Bonjour, {prenom} !</div>
            <div style={{ fontSize: 17, color: '#888', fontWeight: 500 }}>Bienvenue sur votre espace client MiniShop</div>
          </div>
          <span style={badgeStyle}>{badge}</span>
        </div>
        {/* Bloc infos */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, marginBottom: 32 }}>
          <h3 style={{ color: '#1976d2', fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Mes informations</h3>
          <div style={{ fontSize: 17, color: '#444', marginBottom: 8 }}><b>Nom :</b> {user.name || user.username}</div>
          <div style={{ fontSize: 17, color: '#444', marginBottom: 8 }}><b>Email :</b> {user.email}</div>
        </div>
        {/* Bloc commandes (inchangé) */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32 }}>
          <h3 style={{ color: '#1976d2', fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Mes commandes</h3>
          {loading ? (
            <div>Chargement...</div>
          ) : error ? (
            <div style={{ color: '#e53935' }}>{error}</div>
          ) : orders.length === 0 ? (
            <div style={{ color: '#888', fontSize: 16 }}>Aucune commande pour l'instant.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px #ececec' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Date</th>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Produits</th>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id || idx} style={idx % 2 === 1 ? { background: '#f8fafc' } : {}}>
                    <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.date}</td>
                    <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.items.map(i => `${i.Product?.name || i.name} x${i.quantity}`).join(' | ')}</td>
                    <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 