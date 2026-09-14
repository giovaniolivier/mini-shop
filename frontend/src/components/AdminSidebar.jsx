import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdInventory2,
  MdPeople,
  MdListAlt,
  MdBarChart,
  MdAccountBalance,
  MdLogout,
} from 'react-icons/md';
import BrandLogo from './BrandLogo';

const navItems = [
  { to: '/admin', label: 'Aperçu', icon: <MdDashboard size={20} />, end: true },
  { to: '/admin/products', label: 'Catalogue & Stocks', icon: <MdInventory2 size={20} /> },
  { to: '/admin/orders', label: 'Commandes', icon: <MdListAlt size={20} /> },
  { to: '/admin/clients', label: 'CRM Clients', icon: <MdPeople size={20} /> },
  { to: '/admin/finances', label: 'Marketing & Finances', icon: <MdAccountBalance size={20} /> },
  { to: '/admin/analytics', label: 'Performances', icon: <MdBarChart size={20} /> },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const email = profile?.email || 'admin@mail.com';
  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    profile?.username ||
    'Studio Direction';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="ae-sidebar ae-sidebar--console">
      <div className="ae-sidebar-brand ae-console-brand">
        <BrandLogo variant="sidebar" />
      </div>

      <div className="ae-sidebar-section">Pilotage</div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `ae-nav-link${isActive ? ' active' : ''}`}
        >
          {item.icon}
          <span className="label">{item.label}</span>
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      <div className="ae-console-profile">
        <div className="ae-console-avatar" aria-hidden>
          {(displayName || 'S').charAt(0).toUpperCase()}
        </div>
        <div className="ae-console-user">
          <strong>{displayName}</strong>
          <span>{email}</span>
        </div>
      </div>

      <button type="button" className="btn btn-outline ae-console-logout" onClick={handleLogout}>
        <MdLogout size={16} />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}
