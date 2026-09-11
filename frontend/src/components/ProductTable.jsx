import React from 'react';

export default function ProductTable({ products, onEdit, onDelete, stockStyle, loading, error }) {
  return (
    <section className="surface" style={{ padding: '1.35rem', margin: '1.25rem 0' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Catalogue</h2>
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement des produits…</p>
      ) : (
        <div className="ae-table-wrap">
          <table className="ae-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{prod.name}</td>
                  <td>{prod.category}</td>
                  <td>{prod.price} €</td>
                  <td style={stockStyle?.(Number(prod.stock))}>
                    {prod.stock === 0 ? <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>Épuisé</span> : prod.stock}
                  </td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prod.description}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => onEdit(prod)}>
                        Modifier
                      </button>
                      <button type="button" className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => onDelete(prod.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                    Aucun produit
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
