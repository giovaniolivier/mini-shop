import React from 'react';

export default function ClientTable({ clients, onSelect, onChangeSegment, loading, error, input, btn, segments }) {
  return (
    <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' }}>
      <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Clients</h2>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 22, color: '#1976d2' }}>Chargement des clients...</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px #ececec' }}>
            <thead>
              <tr style={{ background: '#e3f2fd' }}>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Nom</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Email</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Segment</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Commandes</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Inscription</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients && clients.map((client, idx) => (
                <tr key={client.id} style={idx % 2 === 1 ? { background: '#f8fafc' } : {}}>
                  <td style={{ padding: 10 }}>{client.name}</td>
                  <td>{client.email}</td>
                  <td>
                    <select value={client.segment} onChange={e => onChangeSegment(client.id, e.target.value)} style={input}>
                      {segments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                    </select>
                  </td>
                  <td>{client.orders}</td>
                  <td>{client.registered}</td>
                  <td><button style={btn} onClick={() => onSelect(client)}>Voir historique</button></td>
                </tr>
              ))}
              {clients && clients.length === 0 && !loading && <tr><td colSpan={6} style={{ color: '#888', textAlign: 'center', padding: 24 }}>Aucun client</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
} 