import React, { useState } from 'react';

export default function ProductCard({ product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url].filter(Boolean);

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 4 }}>
        {images[0] ? (
          <img
            src={images[imgIdx] || images[0]}
            alt={product.name}
            onClick={(e) => {
              e.stopPropagation();
              if (images.length > 1) setImgIdx((imgIdx + 1) % images.length);
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: 'var(--radius-md)',
              background: '#ebe9e4',
            }}
          />
        )}
        {product.category && (
          <span className="ae-badge" style={{ position: 'absolute', top: 10, left: 10 }}>
            {product.category}
          </span>
        )}
      </div>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 650, margin: '0.35rem 0 0.15rem', letterSpacing: '-0.01em' }}>
        {product.name}
      </h2>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-secondary)', fontSize: '1rem' }}>
        {product.price} €
      </p>
    </div>
  );
}
