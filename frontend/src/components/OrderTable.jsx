import React from 'react';

export default function OrderTable({ orders, onChangeStatus, onRefund, onPrint, loading, error }) {
  return (
    <section className="surface" style={{ padding: '1.35rem', margin: '1.25rem 0' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Commandes</h2>
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement des commandes…</p>
      ) : (
        <div className="ae-table-wrap">
          <table className="ae-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produits</th>
                <th>Statut</th>
                <th>Historique</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id}>
                  <td>{order.date}</td>
                  <td>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {(order.items || []).map((item, idx2) => (
                        <li key={(item.id || idx2) + '-' + idx2}>
                          {item.name || item.Product?.name} — {item.price} € × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <span className="ae-badge">{order.status}</span>
                  </td>
                  <td>
                    <ul style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, padding: 0, listStyle: 'none' }}>
                      {order.history?.map((h, i) => (
                        <li key={i}>
                          {h.status} — {h.date}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {order.status !== 'Remboursée' && (
                        <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => onChangeStatus(order.id)}>
                          Statut
                        </button>
                      )}
                      {order.status === 'Livrée' && !order.refunded && (
                        <button type="button" className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => onRefund(order.id)}>
                          Rembourser
                        </button>
                      )}
                      <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => onPrint(order)}>
                        Imprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders?.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                    Aucune commande
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
