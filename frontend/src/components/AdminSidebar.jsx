import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdListAlt,
  MdBarChart,
  MdStore,
  MdCampaign,
  MdSettings,
} from 'react-icons/md';

const items = [
  { to: '/admin', label: 'Dashboard', icon: <MdDashboard size={20} /> },
  { to: '/admin/products', label: 'Produits', icon: <MdShoppingCart size={20} /> },
  { to: '/admin/clients', label: 'Clients', icon: <MdPeople size={20} /> },
  { to: '/admin/orders', label: 'Commandes', icon: <MdListAlt size={20} /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <MdBarChart size={20} /> },
  { to: '/admin/finances', label: 'Finances', icon: <MdStore size={20} /> },
  { to: '/admin/marketing', label: 'Marketing', icon: <MdCampaign size={20} /> },
  { to: '/admin/settings', label: 'Paramètres', icon: <MdSettings size={20} /> },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="ae-sidebar">
      <div className="ae-sidebar-brand">
        Atelier Épure
        <span>Admin</span>
      </div>
      <div className="ae-sidebar-section">Gestion</div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/admin'}
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
