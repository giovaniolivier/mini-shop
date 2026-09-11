import React from 'react';

export default function FinanceTable({ orders, loading, error, filter, setFilter, onExport }) {
  return (
    <section className="surface" style={{ padding: '1.35rem', margin: '1.25rem 0' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Ventes détaillées</h2>
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <input className="input" style={{ width: 160 }} type="date" value={filter.from} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))} />
        <input className="input" style={{ width: 160 }} type="date" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))} />
        <button type="button" className="btn btn-primary" onClick={onExport}>
          Exporter CSV
        </button>
      </div>
      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement des ventes…</p>
      ) : (
        <div className="ae-table-wrap">
          <table className="ae-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Produits</th>
                <th>Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.date}</td>
                  <td>{o.client || ''}</td>
                  <td>{o.items.map((i) => `${i.Product?.name || 'Produit'} ×${i.quantity}`).join(' · ')}</td>
                  <td>{o.total.toFixed(2)} €</td>
                  <td>{o.status || ''}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                    Aucune vente
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
