import React from 'react';

export default function ProductTable({ products, onEdit, onDelete, stockStyle, btn, loading, error }) {
  return (
    <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' }}>
      <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Catalogue</h2>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 22, color: '#1976d2' }}>Chargement des produits...</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px #ececec' }}>
            <thead>
              <tr style={{ background: '#e3f2fd' }}>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Image</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Nom</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Catégorie</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Prix</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Stock</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Description</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products && products.map((prod, idx) => (
                <tr key={prod.id} style={idx % 2 === 1 ? { background: '#f8fafc' } : {}}>
                  <td style={{ textAlign: 'center' }}>
                    {prod.image_url
                      ? <img src={prod.image_url} alt={prod.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 6px #e0e0e0' }} />
                      : <span style={{ color: '#bbb', fontSize: 14 }}>Aucune image</span>
                    }
                  </td>
                  <td style={{ fontWeight: 700, color: '#1976d2', fontSize: 16, textAlign: 'center' }}>{prod.name}</td>
                  <td style={{ textAlign: 'center' }}>{prod.category}</td>
                  <td style={{ textAlign: 'center' }}>{prod.price} €</td>
                  <td style={{ ...stockStyle(Number(prod.stock)), textAlign: 'center' }}>
                    {prod.stock === 0 ? <span style={{ color: '#e53935', fontWeight: 700 }}>Épuisé</span> : prod.stock}
                  </td>
                  <td style={{ textAlign: 'center' }}>{prod.description}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button style={btn} onClick={() => onEdit(prod)}>Modifier</button>
                    <button style={{ ...btn, background: '#eee', color: '#e53935' }} onClick={() => onDelete(prod.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {products && products.length === 0 && !loading && <tr><td colSpan={7} style={{ color: '#888', textAlign: 'center', padding: 24 }}>Aucun produit</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
} 