import React from 'react';

export default function ClientTable({ clients, onSelect, onChangeSegment, loading, error, segments }) {
  return (
    <section className="surface" style={{ padding: '1.35rem', margin: '1.25rem 0' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Clients</h2>
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement des clients…</p>
      ) : (
        <div className="ae-table-wrap">
          <table className="ae-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Segment</th>
                <th>Commandes</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients?.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>
                    <select
                      className="input"
                      value={client.segment}
                      onChange={(e) => onChangeSegment(client.id, e.target.value)}
                      style={{ minWidth: 120 }}
                    >
                      {segments.map((seg) => (
                        <option key={seg} value={seg}>
                          {seg}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{client.orders}</td>
                  <td>{client.registered}</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => onSelect(client)}>
                      Historique
                    </button>
                  </td>
                </tr>
              ))}
              {clients?.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                    Aucun client
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
