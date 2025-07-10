import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/api';
import FinanceTable from '../components/FinanceTable';

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

  // Styles
  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ececec', padding: 24, margin: 8, minWidth: 180, textAlign: 'center', fontWeight: 700 };
  const section = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ececec', padding: 24, margin: '24px 0' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 24, padding: '6px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 8px' };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '6px 12px', fontSize: 16, outline: 'none', margin: '0 8px 8px 0' };

  // Top produits
  const produits = {};
  filtered.forEach(o => o.items.forEach(i => {
    const name = i.Product?.name || 'Produit';
    produits[name] = (produits[name] || 0) + i.quantity;
  }));
  const topProduits = Object.entries(produits).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1976d2', marginBottom: 32 }}>Finances & Reporting</h1>
      {/* Indicateurs clés */}
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={card}>Chiffre d'affaires<br /><span style={{ fontSize: 28, color: '#2e7d32' }}>{totalCA.toFixed(2)} €</span></div>
        <div style={card}>Ventes<br /><span style={{ fontSize: 28, color: '#1976d2' }}>{totalVentes}</span></div>
        <div style={card}>Panier moyen<br /><span style={{ fontSize: 28, color: '#f9a825' }}>{panierMoyen} €</span></div>
        <div style={card}>Remboursements<br /><span style={{ fontSize: 28, color: '#e53935' }}>{remboursements}</span></div>
        <div style={card}>Taxes (20%)<br /><span style={{ fontSize: 22 }}>{taxes.toFixed(2)} €</span></div>
        <div style={card}>Frais livraison<br /><span style={{ fontSize: 22 }}>{fraisLivraison.toFixed(2)} €</span></div>
      </section>
      {/* Tableau des ventes */}
      <FinanceTable
        orders={filtered}
        loading={loading}
        error={error}
        input={input}
        btn={btn}
        filter={filter}
        setFilter={setFilter}
        onExport={exportCSV}
      />
      {/* Analyse des performances */}
      <section style={section}>
        <h2 style={{ fontSize: 22, color: '#1976d2' }}>Top produits</h2>
        <ul>
          {topProduits.map(([name, qty]) => (
            <li key={name} style={{ fontSize: 17 }}>{name} : {qty} ventes</li>
          ))}
          {topProduits.length === 0 && <li style={{ color: '#888' }}>Aucun produit vendu</li>}
        </ul>
      </section>
      {/* Graphique simulé */}
      <section style={section}>
        <h2 style={{ fontSize: 22, color: '#1976d2' }}>Évolution des ventes (simulation)</h2>
        <div style={{ height: 180, background: 'linear-gradient(90deg, #1976d2 10%, #64b5f6 90%)', borderRadius: 12, margin: '24px 0', display: 'flex', alignItems: 'flex-end', gap: 8, padding: 16 }}>
          {/* Barres simulées */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ width: 20, height: Math.random() * 140 + 20, background: '#fff', borderRadius: 6 }} />
          ))}
        </div>
        <div style={{ color: '#888', fontSize: 15 }}>Graphique de démonstration (remplacer par une vraie lib chart.js ou recharts pour production)</div>
      </section>
    </div>
  );
} 