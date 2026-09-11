import React, { useEffect, useState } from 'react';
import { getOrders } from '../../services/ordersApi';
import FinanceTable from '../../components/FinanceTable';

export default function AdminFinances() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des ventes : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtres
  const filtered = orders.filter(o => {
    if (filter.from && new Date(o.date) < new Date(filter.from)) return false;
    if (filter.to && new Date(o.date) > new Date(filter.to)) return false;
    return true;
  });

  // Indicateurs clés
  const totalCA = filtered.reduce((sum, o) => sum + o.total, 0);
  const totalVentes = filtered.length;
  const panierMoyen = totalVentes > 0 ? (totalCA / totalVentes).toFixed(2) : '0.00';
  const remboursements = filtered.filter(o => o.status === 'Remboursée').length;
  const taxes = Math.round(totalCA * 0.2 * 100) / 100;
  const fraisLivraison = filtered.length * 5; // simplifié

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Date', 'Client', 'Produits', 'Total', 'Statut'],
      ...filtered.map(o => [
        o.date,
        o.client || '',
        o.items.map(i => `${i.Product?.name || 'Produit'} x${i.quantity}`).join(' | '),
        o.total,
        o.status || ''
      ])
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ventes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Top produits
  const produits = {};
  filtered.forEach((o) =>
    o.items.forEach((i) => {
      const name = i.Product?.name || 'Produit';
      produits[name] = (produits[name] || 0) + i.quantity;
    })
  );
  const topProduits = Object.entries(produits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="ae-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="ae-page-title">Finances</h1>
      <p className="ae-page-sub">Reporting Atelier Épure</p>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <div className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>CA</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-secondary)' }}>{totalCA.toFixed(2)} €</div>
        </div>
        <div className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Ventes</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{totalVentes}</div>
        </div>
        <div className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Panier moyen</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{panierMoyen} €</div>
        </div>
        <div className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Remboursements</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>{remboursements}</div>
        </div>
        <div className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Taxes</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{taxes.toFixed(2)} €</div>
        </div>
        <div className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Livraison</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{fraisLivraison.toFixed(2)} €</div>
        </div>
      </section>
      <FinanceTable
        orders={filtered}
        loading={loading}
        error={error}
        filter={filter}
        setFilter={setFilter}
        onExport={exportCSV}
      />
      <section className="surface" style={{ padding: '1.35rem', marginTop: '1.25rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>Top produits</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {topProduits.map(([name, qty]) => (
            <li key={name}>{name} : {qty} ventes</li>
          ))}
          {topProduits.length === 0 && <li style={{ color: 'var(--color-muted)' }}>Aucun produit vendu</li>}
        </ul>
      </section>
    </div>
  );
} 