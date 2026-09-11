import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function VisitsChart({ visits, loading, error }) {
  if (loading) return <p style={{ color: 'var(--color-muted)' }}>Chargement du graphique…</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;
  const data = Array.isArray(visits) ? visits : [];

  if (data.length === 0) {
    return <p style={{ color: 'var(--color-muted)' }}>Aucune donnée de visite.</p>;
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="jour" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} stroke="var(--color-border)" />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} stroke="var(--color-border)" />
          <Tooltip />
          <Line type="monotone" dataKey="visites" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
