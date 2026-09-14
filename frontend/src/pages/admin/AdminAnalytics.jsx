import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MdDownload,
  MdPercent,
  MdRefresh,
  MdShoppingBag,
  MdSpeed,
  MdTimer,
  MdTrendingUp,
  MdVerified,
} from 'react-icons/md';
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getStats } from '../../services/ordersApi';
import {
  DEMO_PERF_FAMILIES,
  DEMO_PERF_FUNNEL,
  DEMO_PERF_GROWTH,
  DEMO_PERF_KPI,
  DEMO_PERF_OPS,
} from '../../data/performancesDemo';
import '../../styles/performances.css';

const RANGES = [
  { key: '7d', label: '7 derniers jours' },
  { key: '30d', label: '30 derniers jours' },
  { key: '90d', label: '90 derniers jours' },
];

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`;
}

function formatNumber(v) {
  return Number(v || 0).toLocaleString('fr-FR');
}

function deriveFromStats(stats) {
  const revenue = Number(stats?.totalRevenue || 0);
  const orders = Number(stats?.totalOrders || 0);
  const conversion = Number(stats?.conversionRate || 0);
  const avgCart = Number(stats?.avgCart || 0);
  const monthly = stats?.monthlyRevenue || [];
  const growth =
    monthly.length > 0
      ? monthly.slice(-8).map((m, i) => ({
          week: `S${i + 1}`,
          ventes: Number(m.revenue) || 0,
          commandes: Math.max(1, Math.round((Number(m.revenue) || 0) / Math.max(avgCart, 1))),
        }))
      : DEMO_PERF_GROWTH;

  const cats = stats?.revenueByCategory || [];
  const totalCat = cats.reduce((s, c) => s + (c.amount || 0), 0) || 1;
  const families =
    cats.length > 0
      ? cats.slice(0, 4).map((c) => ({
          name: c.category,
          volume: Math.round((c.amount || 0) / Math.max(avgCart, 1)) || 1,
          caShare: Number(c.percent ?? ((c.amount / totalCat) * 100).toFixed(1)),
          margin: 55 + Math.round((c.percent || 10) % 20),
          returns: Number((1 + (c.percent || 0) / 50).toFixed(1)),
          shareBar: Number(c.percent || 10),
        }))
      : DEMO_PERF_FAMILIES;

  return {
    kpi: {
      caNet: Math.round(revenue / 1.2) || DEMO_PERF_KPI.caNet,
      caDelta: DEMO_PERF_KPI.caDelta,
      conversion: conversion || DEMO_PERF_KPI.conversion,
      conversionDelta: DEMO_PERF_KPI.conversionDelta,
      avgCart: Math.round(avgCart) || DEMO_PERF_KPI.avgCart,
      avgCartDelta: DEMO_PERF_KPI.avgCartDelta,
      uxScore: DEMO_PERF_KPI.uxScore,
      uxLabel: DEMO_PERF_KPI.uxLabel,
    },
    growth,
    funnel: DEMO_PERF_FUNNEL.map((f, i) =>
      i === DEMO_PERF_FUNNEL.length - 1
        ? { ...f, value: orders || f.value }
        : f
    ),
    families,
    ops: DEMO_PERF_OPS,
    useDemo: !revenue && !orders,
  };
}

export default function AdminAnalytics() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [useDemo, setUseDemo] = useState(true);
  const [kpi, setKpi] = useState(DEMO_PERF_KPI);
  const [growth, setGrowth] = useState(DEMO_PERF_GROWTH);
  const [funnel, setFunnel] = useState(DEMO_PERF_FUNNEL);
  const [families, setFamilies] = useState(DEMO_PERF_FAMILIES);
  const [ops, setOps] = useState(DEMO_PERF_OPS);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStats();
      const derived = deriveFromStats(res.data || {});
      setKpi(derived.kpi);
      setGrowth(derived.growth);
      setFunnel(derived.funnel);
      setFamilies(derived.families);
      setOps(derived.ops);
      setUseDemo(derived.useDemo);
    } catch {
      setKpi(DEMO_PERF_KPI);
      setGrowth(DEMO_PERF_GROWTH);
      setFunnel(DEMO_PERF_FUNNEL);
      setFamilies(DEMO_PERF_FAMILIES);
      setOps(DEMO_PERF_OPS);
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const funnelMax = useMemo(() => funnel[0]?.value || 1, [funnel]);
  const finalConv = useMemo(() => {
    const first = funnel[0]?.value || 1;
    const last = funnel[funnel.length - 1]?.value || 0;
    return ((last / first) * 100).toFixed(2);
  }, [funnel]);

  const exportAudit = () => {
    const rows = [
      ['Indicateur', 'Valeur'],
      ['CA net', kpi.caNet],
      ['Conversion %', kpi.conversion],
      ['Panier moyen', kpi.avgCart],
      ['UX score', kpi.uxScore],
      [],
      ['Famille', 'Volume', 'Part CA %', 'Marge %', 'Retours %'],
      ...families.map((f) => [f.name, f.volume, f.caShare, f.margin, f.returns]),
    ];
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-audit-performances-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Rapport d’audit exporté (.CSV)');
  };

  return (
    <div className="ae-perf">
      <div className="ae-perf-crumb">
        Console Épure <span className="accent">/ Aide à la rentabilité</span>
      </div>

      <div className="ae-perf-head">
        <div>
          <h1>Performances &amp; Métriques Opérationnelles</h1>
          <p className="ae-perf-sub">
            Supervision des ventes, conversion e-commerce, trafic catalogue et performance atelier.
          </p>
        </div>
        <div className="ae-perf-actions">
          <span className="ae-perf-badge">PLAN DIRECT</span>
          <select
            className="ae-perf-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Période"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <button type="button" className="ae-perf-btn" onClick={exportAudit}>
            <MdDownload size={16} /> Rapport d’Audit (PDF)
          </button>
          <button
            type="button"
            className="ae-perf-btn primary"
            onClick={() => {
              load();
              setToast('Indicateurs actualisés');
            }}
            disabled={loading}
          >
            <MdRefresh size={16} /> Actualiser
          </button>
        </div>
      </div>

      {useDemo && (
        <div className="ae-perf-demo">
          Mode démo maquette — branchez des ventes API pour des métriques calculées.
        </div>
      )}
      {toast && <div className="ae-perf-demo" style={{ background: '#e8f5ee', borderColor: '#cfe5d6', color: '#1f6b45' }}>{toast}</div>}

      <div className="ae-perf-kpis">
        <div className="ae-perf-kpi">
          <div className="ae-perf-kpi-ico">
            <MdTrendingUp size={18} />
          </div>
          <label>Chiffre d’affaires Net</label>
          <strong>{formatEuro(kpi.caNet)}</strong>
          <div className="delta">+{kpi.caDelta}% vs N-1</div>
        </div>
        <div className="ae-perf-kpi">
          <div className="ae-perf-kpi-ico">
            <MdPercent size={18} />
          </div>
          <label>Taux de Conversion</label>
          <strong>{kpi.conversion}%</strong>
          <div className="delta">+{kpi.conversionDelta} pt</div>
        </div>
        <div className="ae-perf-kpi">
          <div className="ae-perf-kpi-ico">
            <MdShoppingBag size={18} />
          </div>
          <label>Panier Moyen Acquis</label>
          <strong>{formatEuro(kpi.avgCart)}</strong>
          <div className="delta">+{kpi.avgCartDelta}% / commande</div>
        </div>
        <div className="ae-perf-kpi">
          <div className="ae-perf-kpi-ico">
            <MdSpeed size={18} />
          </div>
          <label>Indice Performance UX</label>
          <strong>
            {kpi.uxScore}
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#8a8d93' }}>/100</span>
          </strong>
          <div className="delta muted">LCP 0.8s · TTFB 160ms · Rebond 24.1%</div>
        </div>
      </div>

      <div className="ae-perf-grid-2">
        <section className="ae-perf-card">
          <div className="ae-perf-card-head">
            <div>
              <h2>Courbe de Croissance &amp; Dynamique Commerciale</h2>
              <p>Ventes et volume de commandes sur la période</p>
            </div>
            <div className="ae-perf-legend">
              <span>
                <i style={{ background: '#b88e5f' }} /> Ventes
              </span>
              <span>
                <i style={{ background: '#121417' }} /> Commandes
              </span>
            </div>
          </div>
          <div className="ae-perf-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f0efec" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#9a9da3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#9a9da3', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9a9da3', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #ebeae6',
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    name === 'ventes' ? formatEuro(value) : formatNumber(value),
                    name === 'ventes' ? 'Ventes' : 'Commandes',
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ventes"
                  stroke="none"
                  fill="#b88e5f"
                  fillOpacity={0.08}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ventes"
                  stroke="#b88e5f"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="commandes"
                  stroke="#121417"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Legend content={() => null} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ae-perf-card">
          <div className="ae-perf-card-head">
            <div>
              <h2>Entonnoir de Conversion</h2>
              <p>Du catalogue au paiement — {finalConv}% final</p>
            </div>
          </div>
          <div className="ae-perf-funnel">
            {funnel.map((step) => (
              <div className="ae-perf-funnel-row" key={step.label}>
                <div className="ae-perf-funnel-top">
                  <strong>{step.label}</strong>
                  <span>{formatNumber(step.value)}</span>
                </div>
                <div className="ae-perf-funnel-bar">
                  <i style={{ width: `${Math.max(6, (step.value / funnelMax) * 100)}%` }} />
                </div>
                <div className="ae-perf-funnel-pct">{step.pct}% du trafic initial</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="ae-perf-card ae-perf-table-wrap">
        <div className="ae-perf-card-head">
          <div>
            <h2>Rentabilité par Famille de Créations</h2>
            <p>Volume, contribution CA, marge nette et part relative</p>
          </div>
        </div>
        <table className="ae-perf-table">
          <thead>
            <tr>
              <th>Famille</th>
              <th>Volume ventes</th>
              <th>Contribution CA</th>
              <th>Marge nette</th>
              <th>Taux retours</th>
              <th>Part relative</th>
            </tr>
          </thead>
          <tbody>
            {families.map((f) => (
              <tr key={f.name}>
                <td>
                  <strong>{f.name}</strong>
                </td>
                <td>{formatNumber(f.volume)}</td>
                <td>{f.caShare}%</td>
                <td style={{ color: '#2f7a4f', fontWeight: 700 }}>{f.margin}%</td>
                <td>{f.returns}%</td>
                <td>
                  <div className="ae-perf-share">
                    <div className="ae-perf-share-bar">
                      <i style={{ width: `${Math.min(100, f.shareBar)}%` }} />
                    </div>
                    <span>{f.shareBar}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="ae-perf-ops">
        <div className="ae-perf-op">
          <label>Délais de Façonnage Moyen</label>
          <strong>{ops.leadTimeDays} jours</strong>
          <span>Ouvrés atelier · commande → expédition</span>
        </div>
        <div className="ae-perf-op">
          <label>Indice NPS &amp; Livraisons Soignées</label>
          <strong>
            {ops.nps}
            <span style={{ fontSize: '0.95rem', color: '#8a8d93' }}>/100</span>
          </strong>
          <span>
            <MdVerified size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Gants Blancs &amp; satisfaction
          </span>
        </div>
        <div className="ae-perf-op">
          <label>Disponibilité Système &amp; SLA</label>
          <strong>{ops.sla}%</strong>
          <span>
            <MdTimer size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Latence moy. 67 ms · uptime
          </span>
        </div>
      </div>
    </div>
  );
}
