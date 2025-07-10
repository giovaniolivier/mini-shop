import React from 'react';

export default function OrderTable({ orders, onChangeStatus, onRefund, onPrint, loading, error, btn, btnSec }) {
  return (
    <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' }}>
      <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Commandes</h2>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 22, color: '#1976d2' }}>Chargement des commandes...</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px #ececec' }}>
            <thead>
              <tr style={{ background: '#e3f2fd' }}>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Date</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Produits</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Statut</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Historique</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.map((order, idx) => (
                <tr key={order.id} style={idx % 2 === 1 ? { background: '#f8fafc' } : {}}>
                  <td style={{ padding: 10 }}>{order.date}</td>
                  <td>
                    <ul style={{ margin: 0, padding: 20, listStyle: 'none' }}>
                      {order.items.map((item, idx2) => (
                        <li key={item.id + '-' + idx2}>{item.name} - {item.price} € x {item.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ fontWeight: 700, color: order.status === 'Remboursée' ? '#e53935' : order.status === 'Livrée' ? '#388e3c' : '#1976d2' }}>{order.status}</td>
                  <td>
                    <ul style={{ fontSize: 13, color: '#888', margin: 0, padding: 0, listStyle: 'none' }}>
                      {order.history && order.history.map((h, i) => (
                        <li key={i}>{h.status} - {h.date}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {order.status !== 'Remboursée' && <button style={btn} onClick={() => onChangeStatus(order.id)}>Changer statut</button>}
                    {order.status === 'Livrée' && !order.refunded && <button style={btnSec} onClick={() => onRefund(order.id)}>Retour/remboursement</button>}
                    <button style={btnSec} onClick={() => onPrint(order)}>Imprimer</button>
                  </td>
                </tr>
              ))}
              {orders && orders.length === 0 && !loading && <tr><td colSpan={5} style={{ color: '#888', textAlign: 'center', padding: 24 }}>Aucune commande</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
} 