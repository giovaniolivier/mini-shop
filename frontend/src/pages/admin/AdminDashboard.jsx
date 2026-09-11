import React from 'react';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/admin/products', label: 'Produits' },
  { to: '/admin/orders', label: 'Commandes' },
  { to: '/admin/clients', label: 'Clients' },
  { to: '/admin/finances', label: 'Finances' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/marketing', label: 'Marketing' },
  { to: '/admin/settings', label: 'Paramètres' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="ae-page" style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1 className="ae-page-title">Administration</h1>
      <p className="ae-page-sub">Pilotage Atelier Épure — catalogue, commandes et paramètres.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {links.map((l) => (
          <button key={l.to} type="button" className="btn btn-primary" onClick={() => navigate(l.to)}>
            {l.label}
          </button>
        ))}
      </div>
      <section className="surface" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Vue d&apos;ensemble</h2>
        <p style={{ color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>
          Bienvenue dans l&apos;espace administrateur. Utilisez le menu ou les raccourcis ci-dessus pour gérer la boutique.
        </p>
      </section>
    </div>
  );
}
