import React, { useState } from 'react';
import useFetchAnalytics from '../hooks/useFetchAnalytics';
import VisitsChart from '../components/VisitsChart';
import ConversionTable from '../components/ConversionTable';

export default function AdminAnalytics() {
  const [gaId, setGaId] = useState(localStorage.getItem('gaId') || '');
  const [gaStatus, setGaStatus] = useState('');
  const { analytics, loading, error, refresh } = useFetchAnalytics();

  // Vérification simulée
  const checkGA = () => {
    if (gaId.match(/^G-[A-Z0-9]{8,}$/)) setGaStatus('ID valide (simulation)');
    else setGaStatus('ID invalide');
    localStorage.setItem('gaId', gaId);
  };

  // Export CSV conversion
  const exportCSV = () => {
    if (!analytics || !analytics.conversionCanaux) return;
    const rows = [
      ['Canal', 'Taux de conversion'],
      ...analytics.conversionCanaux.map(c => [c.canal, c.taux])
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversion.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styles
  const section = { background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '10px 14px', fontSize: 16, outline: 'none', margin: '0 8px 12px 0', background: '#f8fafc' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0', transition: 'background 0.2s' };

  if (loading || !analytics) {
    return <div style={{ textAlign: 'center', padding: 64 }}><span style={{ fontSize: 24, color: '#1976d2' }}>Chargement des statistiques...</span></div>;
  }

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 1100, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif', position: 'relative' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Analytics</h1>
      {/* Google Analytics */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Google Analytics</h2>
        <div style={{ marginBottom: 12 }}>
          <input style={input} placeholder="ID Google Analytics (G-XXXX...)" value={gaId} onChange={e => setGaId(e.target.value)} />
          <button style={btn} onClick={checkGA}>Vérifier la connexion</button>
          {gaStatus && <span style={{ marginLeft: 16, color: gaStatus.includes('valide') ? '#388e3c' : '#e53935' }}>{gaStatus}</span>}
        </div>
        <div style={{ color: '#888', fontSize: 15 }}>
          Pour activer le suivi réel, ajoutez le script Google Analytics dans public/index.html.<br />
          Cette section est une simulation pour la démo.
        </div>
      </section>
      {/* Statistiques fréquentation */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Statistiques de fréquentation</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 18 }}>
          <div><b>Visiteurs uniques :</b> {analytics.visiteurs}</div>
          <div><b>Pages vues :</b> {analytics.pagesVues}</div>
          <div><b>Durée moyenne :</b> {analytics.duree}</div>
          <div><b>Taux de rebond :</b> {analytics.rebond}</div>
        </div>
        {/* Graphique visites */}
        <VisitsChart visits={analytics.visites} loading={loading} error={error} />
        <div style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Visites quotidiennes sur 30 jours</div>
      </section>
      {/* Analyse comportement utilisateur */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Comportement utilisateur</h2>
        <div style={{ marginBottom: 12 }}>
          <b>Pages les plus visitées :</b>
          <ul>
            {analytics.pages && analytics.pages.map(p => <li key={p.url}>{p.url} : {p.vues} vues</li>)}
          </ul>
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Parcours type :</b>
          <ul>
            {analytics.parcours && analytics.parcours.map((seq, i) => <li key={i}>{seq.join(' → ')}</li>)}
          </ul>
        </div>
        <div><b>Taux d'abandon panier :</b> {analytics.abandon}</div>
      </section>
      {/* Rapports de conversion */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Rapports de conversion</h2>
        <div style={{ marginBottom: 12 }}><b>Taux de conversion global :</b> {analytics.conversion}</div>
        <ConversionTable conversionCanaux={analytics.conversionCanaux} loading={loading} error={error} />
        <button style={btn} onClick={exportCSV}>Exporter CSV</button>
      </section>
    </div>
  );
} 