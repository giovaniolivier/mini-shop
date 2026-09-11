import React, { useState } from 'react';
import useFetchAnalytics from '../../hooks/useFetchAnalytics';
import VisitsChart from '../../components/VisitsChart';
import ConversionTable from '../../components/ConversionTable';

export default function AdminAnalytics() {
  const [gaId, setGaId] = useState(localStorage.getItem('gaId') || '');
  const [gaStatus, setGaStatus] = useState('');
  const { analytics, loading, error } = useFetchAnalytics();

  const checkGA = () => {
    if (gaId.match(/^G-[A-Z0-9]{8,}$/)) setGaStatus('ID valide (simulation)');
    else setGaStatus('ID invalide');
    localStorage.setItem('gaId', gaId);
  };

  const exportCSV = () => {
    if (!analytics || !analytics.conversionCanaux) return;
    const rows = [
      ['Canal', 'Taux de conversion'],
      ...analytics.conversionCanaux.map((c) => [c.canal, c.taux]),
    ];
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversion.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !analytics) {
    return (
      <div className="ae-page">
        <p style={{ color: 'var(--color-muted)' }}>Chargement des statistiques…</p>
      </div>
    );
  }

  return (
    <div className="ae-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="ae-page-title">Analytics</h1>
      <p className="ae-page-sub">Indicateurs Atelier Épure (démo)</p>

      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Google Analytics</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <input
            className="input"
            style={{ flex: '1 1 220px' }}
            placeholder="ID Google Analytics (G-XXXX...)"
            value={gaId}
            onChange={(e) => setGaId(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={checkGA}>
            Vérifier
          </button>
          {gaStatus && <span style={{ alignSelf: 'center', color: 'var(--color-muted)' }}>{gaStatus}</span>}
        </div>
      </section>

      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Fréquentation</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
          <div><b>Visiteurs :</b> {analytics.visiteurs}</div>
          <div><b>Pages vues :</b> {analytics.pagesVues}</div>
          <div><b>Durée :</b> {analytics.duree}</div>
          <div><b>Rebond :</b> {analytics.rebond}</div>
        </div>
        <VisitsChart visits={analytics.visites} loading={loading} error={error} />
      </section>

      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Comportement</h2>
        <div style={{ marginBottom: 12 }}>
          <b>Pages les plus visitées :</b>
          <ul>
            {analytics.pages?.map((p) => (
              <li key={p.url}>{p.url} : {p.vues} vues</li>
            ))}
          </ul>
        </div>
        <div><b>Abandon panier :</b> {analytics.abandon}</div>
      </section>

      <section className="surface" style={{ padding: '1.35rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Conversion</h2>
        <div style={{ marginBottom: 12 }}><b>Taux global :</b> {analytics.conversion}</div>
        <ConversionTable conversionCanaux={analytics.conversionCanaux} loading={loading} error={error} />
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={exportCSV}>
          Exporter CSV
        </button>
      </section>
    </div>
  );
}
