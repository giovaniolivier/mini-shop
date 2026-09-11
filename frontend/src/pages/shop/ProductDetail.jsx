import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../../services/productsApi';

export default function ProductDetail({ onAddToCart, openCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    getProducts().then((res) => {
      const found = res.data.find((p) => p.id === parseInt(id, 10));
      setProduct(found);
    });
  }, [id]);

  if (!product) {
    return (
      <div className="ae-page">
        <p style={{ color: 'var(--color-muted)' }}>Chargement…</p>
      </div>
    );
  }

  const addToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      if (typeof openCart === 'function') openCart();
    }
  };

  return (
    <div className="ae-page" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button type="button" className="btn btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/home')}>
        ← Retour
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 1fr) 1.2fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: '100%',
              aspectRatio: '1',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              background: '#ebe9e4',
            }}
          />
        ) : (
          <div style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', background: '#ebe9e4' }} />
        )}
        <div>
          {product.category && <span className="ae-badge">{product.category}</span>}
          <h1 className="ae-page-title" style={{ marginTop: '0.75rem' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)', margin: '0.5rem 0 1rem' }}>
            {product.price} €
          </p>
          <p className="ae-page-sub" style={{ marginBottom: '1.5rem' }}>
            {product.description || 'Pièce sélectionnée pour Atelier Épure.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={addToCart}>
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
