import React from 'react';

export default function TransporterTable({ transporteurs, newTransport, setNewTransport, onAdd, onDelete, loading, error, input, btn }) {
  return (
    <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' }}>
      <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Transporteurs</h2>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 20, color: '#1976d2' }}>Chargement des transporteurs...</span>
        </div>
      ) : (
        <>
          <ul style={{ paddingLeft: 0 }}>
            {transporteurs.map((t, idx) => (
              <li key={t.nom + idx} style={{ fontSize: 17, margin: '8px 0', listStyle: 'none' }}>
                <b>{t.nom}</b> - {t.frais} € - {t.delai}
                <button style={{ ...btn, background: '#eee', color: '#e53935', marginLeft: 12 }} onClick={() => onDelete(idx)}>Supprimer</button>
              </li>
            ))}
            {transporteurs.length === 0 && <li style={{ color: '#888', listStyle: 'none' }}>Aucun transporteur</li>}
          </ul>
          <div style={{ marginTop: 12 }}>
            <input style={input} placeholder="Nom" value={newTransport.nom} onChange={e => setNewTransport(nt => ({ ...nt, nom: e.target.value }))} />
            <input style={input} type="number" placeholder="Frais (€)" value={newTransport.frais} onChange={e => setNewTransport(nt => ({ ...nt, frais: e.target.value }))} />
            <input style={input} placeholder="Délais" value={newTransport.delai} onChange={e => setNewTransport(nt => ({ ...nt, delai: e.target.value }))} />
            <button style={btn} onClick={onAdd}>Ajouter</button>
          </div>
        </>
      )}
    </section>
  );
} 