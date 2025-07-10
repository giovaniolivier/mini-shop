import React, { useEffect, useState } from 'react';
import axios from 'axios';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

function Badge({ status }) {
  const color = status === 'Validée' ? '#43a047' : status === 'Remboursée' ? '#e53935' : '#1976d2';
  return <span style={{ background: color, color: '#fff', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: 15 }}>{status}</span>;
}

function Facture({ order }) {
  // Simule une facture simple (HTML imprimable)
  return (
    <div style={{ padding: 32, fontFamily: 'Inter, Arial, sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: '#1976d2' }}>Facture - Commande #{order.id}</h2>
      <div>Date : {formatDate(order.date)}</div>
      <div>Client : {order.client}</div>
      <hr style={{ margin: '18px 0' }} />
      <table style={{ width: '100%', marginBottom: 18 }}>
        <thead>
          <tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr>
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
      <div style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }}>Total : {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</div>
      <div style={{ marginTop: 18 }}>Statut : <Badge status={order.status} /></div>
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

  const handleDetail = (order) => setSelected(order);
  const handleClose = () => setSelected(null);
  const handleFacture = (order) => { setSelected(order); setShowFacture(true); };
  const handleCloseFacture = () => setShowFacture(false);
  const handlePrint = () => window.print();

  return (
    <div style={{ background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', padding: '2rem 0 0 0', borderRadius: 10, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1 }}>Mes commandes</h2>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32 }}>
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
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'center' }}>Date</th>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'center' }}>Produits</th>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'center' }}>Total</th>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'center' }}>Statut</th>
                  <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id || idx} style={idx % 2 === 1 ? { background: '#f8fafc' } : {}}>
                    <td style={{ padding: 13, textAlign: 'center' }}>{formatDate(order.date)}</td>
                    <td style={{ padding: 13, textAlign: 'center' }}>{order.items.map(i => `${i.Product?.name || i.name} x${i.quantity}`).join(', ')}</td>
                    <td style={{ padding: 13, fontWeight: 700, textAlign: 'center' }}>{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</td>
                    <td style={{ padding: 13, textAlign: 'center' }}><Badge status={order.status} /></td>
                    <td style={{ padding: 13, textAlign: 'center' }}>
                      <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, marginRight: 8, cursor: 'pointer' }} onClick={() => handleDetail(order)}>Détail</button>
                      <button style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleFacture(order)}>Facture</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Modale détail commande */}
      {selected && !showFacture && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleClose}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #e0e0e0', padding: 36, minWidth: 420, maxWidth: 600, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={handleClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#888', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ color: '#1976d2', fontWeight: 800, fontSize: 24, marginBottom: 18 }}>Détail commande #{selected.id}</h3>
            <div style={{ marginBottom: 10 }}>Date : <b>{formatDate(selected.date)}</b></div>
            <div style={{ marginBottom: 10 }}>Statut : <Badge status={selected.status} /></div>
            <div style={{ marginBottom: 10 }}>Client : <b>{selected.client}</b></div>
            <table style={{ width: '100%', margin: '18px 0' }}>
              <thead>
                <tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr>
              </thead>
              <tbody>
                {selected.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.Product?.name || item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toFixed(2)} €</td>
                    <td>{(item.price * item.quantity).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1976d2', marginTop: 18 }}>Total : {selected.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</div>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, marginRight: 8, cursor: 'pointer' }} onClick={() => handleFacture(selected)}>Facture</button>
              <button style={{ background: '#eee', color: '#1976d2', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={handleClose}>Fermer</button>
            </div>
          </div>
        </div>
      )}
      {/* Modale facture */}
      {showFacture && selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleCloseFacture}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #e0e0e0', padding: 36, minWidth: 420, maxWidth: 700, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseFacture} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#888', cursor: 'pointer' }}>&times;</button>
            <Facture order={selected} />
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, marginRight: 8, cursor: 'pointer' }} onClick={handlePrint}>Imprimer</button>
              <button style={{ background: '#eee', color: '#1976d2', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={handleCloseFacture}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 