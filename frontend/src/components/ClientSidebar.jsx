import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MdHome, MdPerson, MdShoppingCart, MdListAlt } from 'react-icons/md';
import BrandLogo from './BrandLogo';

const items = [
  { to: '/dashboard', label: 'Accueil', icon: <MdHome size={20} /> },
  { to: '/home', label: 'Boutique', icon: <MdShoppingCart size={20} /> },
  { to: '/client/orders', label: 'Commandes', icon: <MdListAlt size={20} /> },
  { to: '/profile', label: 'Profil', icon: <MdPerson size={20} /> },
];

export default function ClientSidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="ae-sidebar">
      <div className="ae-sidebar-brand">
        <BrandLogo variant="sidebar" />
        <span>Espace client</span>
      </div>
      <div className="ae-sidebar-section">Navigation</div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `ae-nav-link${isActive ? ' active' : ''}`}
        >
          {item.icon}
          <span className="label">{item.label}</span>
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <button className="btn btn-outline" onClick={handleLogout} style={{ margin: '0.5rem 0.35rem 1rem' }}>
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}
