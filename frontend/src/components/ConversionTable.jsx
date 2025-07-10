import React from 'react';

export default function ConversionTable({ conversionCanaux, loading, error }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 32 }}><span style={{ fontSize: 20, color: '#1976d2' }}>Chargement des conversions...</span></div>;
  }
  if (error) {
    return <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>;
  }
  return (
    <table style={{ width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', margin: '18px 0', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#e3f2fd' }}>
          <th style={{ padding: 10, textAlign: 'left' }}>Canal</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Taux de conversion</th>
        </tr>
      </thead>
      <tbody>
        {conversionCanaux && conversionCanaux.map(c => (
          <tr key={c.canal}>
            <td style={{ padding: 10 }}>{c.canal}</td>
            <td style={{ padding: 10 }}>{c.taux}</td>
          </tr>
        ))}
        {conversionCanaux && conversionCanaux.length === 0 && (
          <tr><td colSpan={2} style={{ color: '#888', padding: 10 }}>Aucune donnée</td></tr>
        )}
      </tbody>
    </table>
  );
} 