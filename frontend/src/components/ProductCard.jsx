import React, { useState } from 'react';

const imgStyle = {
  width: '100%',
  borderRadius: 12,
  transition: 'transform 0.2s',
  cursor: 'pointer',
  boxShadow: '0 2px 8px #e0e0e0',
};
const imgZoom = {
  transform: 'scale(1.15)',
  zIndex: 2,
  boxShadow: '0 8px 32px #bdbdbd',
};

export default function ProductCard({ product, zoom }) {
  const [hover, setHover] = useState(false);
  // Galerie d'images (pour la démo, on duplique l'image_url si pas d'array)
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url, product.image_url, product.image_url];
  const [imgIdx, setImgIdx] = useState(0);
  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <img
          src={images[imgIdx]}
          alt={product.name}
          style={zoom && hover ? { ...imgStyle, ...imgZoom } : imgStyle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => setImgIdx((imgIdx + 1) % images.length)}
        />
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 13, color: '#1976d2' }}>
            {imgIdx + 1}/{images.length}
          </div>
        )}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px 0' }}>{product.name}</h2>
      {product.category && <div style={{ color: '#388e3c', fontSize: 15, marginBottom: 4 }}>{product.category}</div>}
      <p style={{ fontWeight: 600, color: '#1976d2', fontSize: 18 }}>{product.price} €</p>
      {product.description && <p style={{ color: '#555', fontSize: 15, margin: '8px 0' }}>{product.description}</p>}
    </div>
  );
}
