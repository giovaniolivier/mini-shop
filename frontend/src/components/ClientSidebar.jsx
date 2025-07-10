import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MdHome, MdPerson, MdShoppingCart, MdListAlt } from 'react-icons/md';

const sidebarStyle = {
  width: 220,
  background: 'linear-gradient(120deg, #fff 0%, #e3f2fd 100%)',
  color: '#1976d2',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem 0.5rem',
  boxShadow: '2px 0 16px #e5eaf2',
  zIndex: 100,
};
const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  color: '#1976d2',
  textDecoration: 'none',
  margin: '0.5rem 0',
  fontSize: 17,
  fontWeight: 500,
  borderRadius: 10,
  padding: '10px 18px',
  transition: 'background 0.2s, color 0.2s',
};
const activeLinkStyle = {
  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
  color: '#fff',
};
const sectionTitle = {
  fontSize: 13,
  color: '#888',
  fontWeight: 700,
  margin: '1.5rem 0 0.5rem 18px',
  letterSpacing: 1,
};

const items = [
  { to: '/dashboard', label: 'Accueil', icon: <MdHome size={22} /> },
  { to: '/profile', label: 'Profil', icon: <MdPerson size={22} /> },
  { to: '/home', label: 'Produits', icon: <MdShoppingCart size={22} /> },
  { to: '/client/orders', label: 'Commandes', icon: <MdListAlt size={22} /> },
];

export default function ClientSidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
    setTimeout(() => window.location.reload(), 100);
  };
  return (
    <aside style={sidebarStyle}>
      <div style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 32, color: '#1976d2', letterSpacing: 1, textAlign: 'center' }}>
        MON <span style={{ color: '#64b5f6' }}>ESPACE</span>
      </div>
      <div style={sectionTitle}>NAVIGATION</div>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <button onClick={handleLogout} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0e0', margin: '24px 12px 40px 12px', width: 'calc(100% - 24px)' }}>Déconnexion</button>
    </aside>
  );
} 