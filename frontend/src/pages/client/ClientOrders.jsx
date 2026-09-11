import React, { useEffect, useState } from 'react';
import { getClientOrders } from '../../services/ordersApi';
import { formatDate } from '../../utils/format';

function Badge({ status }) {
  const isOk = status === 'Validée';
  const isBad = status === 'Remboursée';
  return (
    <span
      className="ae-badge"
      style={{
        background: isOk ? 'rgba(31,58,82,0.12)' : isBad ? 'var(--color-danger-bg)' : 'rgba(184,115,51,0.12)',
        color: isOk ? 'var(--color-tertiary)' : isBad ? 'var(--color-danger)' : 'var(--color-secondary)',
      }}
    >
      {status}
    </span>
  );
}

function Facture({ order }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Facture — Commande #{order.id}</h2>
      <div>Date : {formatDate(order.date)}</div>
      <div>Client : {order.client}</div>
      <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
      <div className="ae-table-wrap">
        <table className="ae-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Qté</th>
              <th>Prix</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.Product?.name || item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)} €</td>
                <td>{(item.price * item.quantity).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontWeight: 700, marginTop: 14, color: 'var(--color-secondary)' }}>
        Total : {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €
      </div>
      <div style={{ marginTop: 12 }}>
        Statut : <Badge status={order.status} />
      </div>
    </div>
  );
}

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showFacture, setShowFacture] = useState(false);

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

  return (
    <div className="ae-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="ae-page-title">Mes commandes</h1>
      <p className="ae-page-sub">Historique de vos achats Atelier Épure.</p>

      <section className="surface" style={{ padding: '1.25rem' }}>
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
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.items.map((i) => `${i.Product?.name || i.name} ×${i.quantity}`).join(', ')}</td>
                    <td>{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</td>
                    <td>
                      <Badge status={order.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => { setSelected(order); setShowFacture(false); }}>
                          Détail
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => { setSelected(order); setShowFacture(true); }}>
                          Facture
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && !showFacture && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18,20,23,0.35)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelected(null)}
        >
          <div className="surface" style={{ padding: 28, maxWidth: 560, width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn btn-secondary" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px' }} onClick={() => setSelected(null)}>
              ✕
            </button>
            <h3 style={{ marginTop: 0 }}>Commande #{selected.id}</h3>
            <p>
              Date : <b>{formatDate(selected.date)}</b>
            </p>
            <p>
              Statut : <Badge status={selected.status} />
            </p>
            <div className="ae-table-wrap" style={{ marginTop: 12 }}>
              <table className="ae-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.Product?.name || item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showFacture && selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18,20,23,0.35)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowFacture(false)}
        >
          <div className="surface" style={{ padding: 28, maxWidth: 640, width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn btn-secondary" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px' }} onClick={() => setShowFacture(false)}>
              ✕
            </button>
            <Facture order={selected} />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
