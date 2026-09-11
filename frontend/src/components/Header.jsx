import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

export default function Header({ onCartClick, cartCount }) {
  const role = localStorage.getItem('role');
  const showCart = role !== 'admin';

  return (
    <header className="ae-header">
      <div className="ae-header-brand">
        Atelier <em>Épure</em>
      </div>
      <div style={{ flex: 1 }} />
      {showCart && (
        <button type="button" className="ae-cart-btn" onClick={onCartClick} aria-label="Ouvrir le panier">
          <FaShoppingCart size={16} />
          {cartCount > 0 && <span className="ae-cart-count">{cartCount}</span>}
        </button>
      )}
    </header>
  );
}
