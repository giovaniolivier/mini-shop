import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

export default function ProductDetail({ onAddToCart, openCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products`)
      .then(res => {
        const found = res.data.find(p => p.id === parseInt(id));
        setProduct(found);
      });
  }, [id]);

  if (!product) return <div style={{ padding: 32 }}>Chargement...</div>;

  // Ajout panier
  const addToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      if (typeof openCart === 'function') openCart();
    } else {
      // fallback localStorage (devrait ne jamais arriver)
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const found = cart.find(item => item.id === product.id);
      let updated;
      if (found) {
        updated = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...cart, { ...product, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
    }
    alert('Produit ajouté au panier !');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh' }}>
      <button onClick={() => navigate('/home')} style={{ marginBottom: 24, background: '#eee', border: 'none', borderRadius: 12, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>← Retour à la liste</button>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {product.image_url && (
            <img src={product.image_url} alt={product.name} style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 14, boxShadow: '0 2px 12px #ececec' }} />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1976d2', marginBottom: 12 }}>{product.name}</h2>
            <div style={{ color: '#555', fontSize: 18, marginBottom: 8 }}>{product.category}</div>
            <div style={{ color: '#222', fontSize: 22, fontWeight: 700, marginBottom: 18 }}>{product.price} €</div>
            <div style={{ color: '#888', fontSize: 16, marginBottom: 18 }}>{product.description}</div>
            <button onClick={addToCart} style={{ background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 28px', fontSize: 18, fontWeight: 700, cursor: 'pointer', marginRight: 12 }}>Ajouter au panier</button>
          </div>
        </div>
      </div>
    </div>
  );
} 