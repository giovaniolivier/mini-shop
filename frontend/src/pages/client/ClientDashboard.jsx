import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientOrders } from '../../services/ordersApi';
import { formatDate } from '../../utils/format';

export default function ClientDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem('user') || '{"name":"Client","email":"demo@mail.com"}')
  );

  useEffect(() => {
    setLoading(true);
    getClientOrders()
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des commandes');
        setLoading(false);
      });
  }, []);

  const prenom = (user.name || user.username || 'Client').split(' ')[0];
  const initial = prenom.charAt(0).toUpperCase();

  return (
    <div className="ae-page" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.75rem' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            background: 'var(--color-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          {initial}
        </div>
        <div>
          <h1 className="ae-page-title" style={{ marginBottom: 4 }}>
            Bonjour, {prenom}
          </h1>
          <p className="ae-page-sub" style={{ margin: 0 }}>
            Votre espace Atelier Épure
          </p>
        </div>
        <span className="ae-badge" style={{ marginLeft: 'auto' }}>
          Client
        </span>
      </div>

      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Informations</h2>
        <p style={{ margin: '0 0 4px' }}>
          <b>Nom :</b> {user.name || user.username}
        </p>
        <p style={{ margin: 0 }}>
          <b>Email :</b> {user.email}
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <Link to="/home" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Voir la boutique
          </Link>
          <Link to="/client/orders" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            Mes commandes
          </Link>
        </div>
      </section>

      <section className="surface" style={{ padding: '1.35rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem' }}>Dernières commandes</h2>
        {loading ? (
          <p style={{ color: 'var(--color-muted)' }}>Chargement…</p>
        ) : error ? (
          <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        ) : orders.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produits</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.items.map((i) => `${i.Product?.name || i.name} ×${i.quantity}`).join(' · ')}</td>
                    <td>{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
