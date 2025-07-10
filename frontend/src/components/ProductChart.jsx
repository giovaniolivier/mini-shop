import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProductChart({ chartData }) {
  return (
    <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: 24, color: '#1976d2', fontWeight: 800, marginBottom: 24, textAlign: 'center', letterSpacing: 0.5 }}>Produits par catégorie</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} style={{ fontFamily: 'inherit' }} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
          <XAxis dataKey="category" stroke="#1976d2" style={{ fontWeight: 700 }} tick={{ fontSize: 15 }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
          <YAxis allowDecimals={false} stroke="#1976d2" tick={{ fontSize: 15 }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
          <Bar dataKey="count" fill="#1976d2" radius={[8, 8, 0, 0]} barSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
} 