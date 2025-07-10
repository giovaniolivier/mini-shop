import React from 'react';

export default function PromoTable({ promos, promoForm, setPromoForm, onAdd, onDelete, loading, error, input, btn }) {
  return (
    <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' }}>
      <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Codes promo</h2>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <input style={input} placeholder="Code" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value }))} />
        <select style={input} value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}>
          <option value="pourcentage">% réduction</option>
          <option value="montant">Montant fixe (€)</option>
        </select>
        <input style={input} type="number" placeholder="Valeur" value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))} />
        <input style={input} type="date" value={promoForm.validUntil} onChange={e => setPromoForm(f => ({ ...f, validUntil: e.target.value }))} />
        <button style={btn} onClick={onAdd}>Ajouter</button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 20, color: '#1976d2' }}>Chargement des codes promo...</span>
        </div>
      ) : (
        <ul style={{ paddingLeft: 0 }}>
          {promos.map(p => (
            <li key={p.id} style={{ marginBottom: 6, listStyle: 'none' }}>
              <b>{p.code}</b> - {p.type === 'pourcentage' ? p.value + '%' : p.value + '€'} {p.validUntil && <span>(jusqu'au {p.validUntil})</span>}
              <button style={{ ...btn, background: '#eee', color: '#e53935' }} onClick={() => onDelete(p.id)}>Supprimer</button>
            </li>
          ))}
          {promos.length === 0 && <li style={{ color: '#888', listStyle: 'none' }}>Aucun code promo</li>}
        </ul>
      )}
    </section>
  );
} 