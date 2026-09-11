import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function ProductChart({ chartData }) {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 24 }}>
          <XAxis
            dataKey="category"
            stroke="var(--color-muted)"
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--color-muted)"
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <Bar dataKey="count" fill="var(--color-secondary)" radius={[8, 8, 0, 0]} barSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
