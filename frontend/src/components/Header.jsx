import React from 'react';
import logo from '../shop.png';
import { FaShoppingCart } from 'react-icons/fa';

const headerStyle = {
  height: 64,
  background: '#fff',
  borderBottom: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 240, // pour laisser la place à la sidebar
  paddingRight: 32,
  position: 'sticky',
  top: 0,
  zIndex: 99,
};

export default function Header({ onCartClick, cartCount }) {

  return (
    <header style={headerStyle}>
      <img src={logo} alt="logo" style={{ height: 60 }} />
      <span style={{ fontWeight: 'bold', fontSize: 22, color: '#222' }}>MiniShop</span>
      <div style={{ flex: 1 }} />
      {/* Icône panier supprimée */}
      {/* Espace utilisateur ou notifications ici plus tard */}
    </header>
  );
} 