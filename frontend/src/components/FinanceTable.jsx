import React from 'react';

export default function FinanceTable({ orders, loading, error, input, btn, filter, setFilter, onExport }) {
  return (
    <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ececec', padding: 24, margin: '24px 0' }}>
      <h2 style={{ fontSize: 22, color: '#1976d2' }}>Ventes détaillées</h2>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <input style={input} type="date" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
        <input style={input} type="date" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
        <button style={btn} onClick={onExport}>Exporter CSV</button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 20, color: '#1976d2' }}>Chargement des ventes...</span>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ padding: 8 }}>Date</th>
              <th>Client</th>
              <th>Produits</th>
              <th>Total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{o.date}</td>
                <td>{o.client || ''}</td>
                <td>{o.items.map(i => `${i.Product?.name || 'Produit'} x${i.quantity}`).join(' | ')}</td>
                <td>{o.total.toFixed(2)} €</td>
                <td>{o.status || ''}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} style={{ color: '#888', textAlign: 'center', padding: 24 }}>Aucune vente</td></tr>}
          </tbody>
        </table>
      )}
    </section>
  );
} 