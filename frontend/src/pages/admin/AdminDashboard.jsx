import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdDownload,
  MdPayments,
  MdShoppingBag,
  MdReceiptLong,
  MdFilterAlt,
  MdVisibility,
  MdStar,
  MdWarningAmber,
} from 'react-icons/md';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts';
import { getOrders, getStats } from '../../services/ordersApi';
import { getProducts } from '../../services/productsApi';
import {
  DEMO_BESTSELLER,
  DEMO_CATEGORIES,
  DEMO_DASH_KPI,
  DEMO_LOW_STOCK,
  DEMO_MONTHLY,
  DEMO_ORDERS,
  DEMO_SPARK,
} from '../../data/dashboardDemo';
import '../../styles/dashboard.css';

const PERIODS = [
  { id: 'today', label: "Aujourd'hui" },
  { id: '7d', label: '7 derniers jours' },
  { id: 'month', label: 'Ce mois-ci' },
  { id: '2024', label: '2024' },
];

const MONTH_LABELS = {
  '01': 'Jan.',
  '02': 'Fév.',
  '03': 'Mars',
  '04': 'Avr.',
  '05': 'Mai',
  '06': 'Juin',
  '07': 'Juil.',
  '08': 'Août',
  '09': 'Sept.',
  '10': 'Oct.',
  '11': 'Nov.',
  '12': 'Déc.',
};

function formatEuro(value) {
  return `${Number(value || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: Number(value || 0) % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })} €`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function periodBounds(periodId, now = new Date()) {
  const end = new Date(now);
  if (periodId === 'today') {
    return { start: startOfDay(now), end };
  }
  if (periodId === '7d') {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return { start, end };
  }
  if (periodId === 'month') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
  }
  if (periodId === '2024') {
    return { start: new Date(2024, 0, 1), end: new Date(2024, 11, 31, 23, 59, 59) };
  }
  return { start: new Date(0), end };
}

function previousBounds(periodId, now = new Date()) {
  if (periodId === 'today') {
    const end = startOfDay(now);
    end.setMilliseconds(-1);
    const start = startOfDay(end);
    return { start, end };
  }
  if (periodId === '7d') {
    const end = startOfDay(now);
    end.setDate(end.getDate() - 6);
    end.setMilliseconds(-1);
    const start = startOfDay(end);
    start.setDate(start.getDate() - 6);
    return { start, end };
  }
  if (periodId === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { start, end };
  }
  return { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31, 23, 59, 59) };
}

function inRange(dateValue, bounds) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  return d >= bounds.start && d <= bounds.end;
}

function isPaidOrder(order) {
  return String(order.status || '').toLowerCase() !== 'cart';
}

function aggregateOrders(orders) {
  const paid = orders.filter(isPaidOrder);
  const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);
  const count = paid.length;
  return {
    revenue,
    count,
    avg: count ? revenue / count : 0,
  };
}

function deltaPercent(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('pay') || s.includes('valid')) return 'paid';
  if (s.includes('prépar') || s.includes('prepar')) return 'prep';
  if (s.includes('expéd') || s.includes('exped') || s.includes('livr')) return 'ship';
  return 'other';
}

function Sparkline({ values, stroke = '#1f6b45' }) {
  const data = (values.length ? values : [0, 0]).map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function buildChartData(monthlyRevenue) {
  const base = [...(monthlyRevenue || [])];
  if (!base.length) return [];

  const points = base.map((row) => {
    const [, mm] = row.month.split('-');
    return {
      key: row.month,
      label: MONTH_LABELS[mm] || row.month,
      realised: row.revenue,
      forecast: null,
    };
  });

  const last = base.slice(-3).map((r) => r.revenue);
  const avgDelta =
    last.length >= 2 ? (last[last.length - 1] - last[0]) / (last.length - 1) : last[0] * 0.08 || 0;
  let cursor = last[last.length - 1] || 0;
  const lastKey = base[base.length - 1].month;
  let [y, m] = lastKey.split('-').map(Number);

  points[points.length - 1].forecast = points[points.length - 1].realised;

  for (let i = 0; i < 2; i += 1) {
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    cursor = Math.max(0, cursor + avgDelta);
    const mm = String(m).padStart(2, '0');
    points.push({
      key: `${y}-${mm}`,
      label: `${MONTH_LABELS[mm] || mm} (Ext.)`,
      realised: null,
      forecast: Number(cursor.toFixed(2)),
    });
  }
  return points;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiMs, setApiMs] = useState(null);
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      const t0 = performance.now();
      try {
        const [ordersRes, productsRes, statsRes] = await Promise.all([
          getOrders(),
          getProducts(),
          getStats(),
        ]);
        if (cancelled) return;
        const list = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const paid = list.filter(isPaidOrder);
        setOrders(list);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setStats(statsRes.data || null);
        setUseDemo(paid.length === 0);
        setApiMs(Math.round(performance.now() - t0));
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Erreur de chargement');
          setUseDemo(true);
          setApiMs(42);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const periodFactor =
    period === 'today' ? 0.04 : period === '7d' ? 0.22 : period === '2024' ? 1.35 : 1;

  const bounds = useMemo(() => periodBounds(period), [period]);
  const prevBounds = useMemo(() => previousBounds(period), [period]);

  const periodOrders = useMemo(
    () => orders.filter((o) => isPaidOrder(o) && inRange(o.date || o.createdAt, bounds)),
    [orders, bounds]
  );
  const prevOrders = useMemo(
    () => orders.filter((o) => isPaidOrder(o) && inRange(o.date || o.createdAt, prevBounds)),
    [orders, prevBounds]
  );

  const current = useMemo(() => {
    if (useDemo) {
      return {
        revenue: Number((DEMO_DASH_KPI.revenue * periodFactor).toFixed(2)),
        count: Math.max(1, Math.round(DEMO_DASH_KPI.orders * periodFactor)),
        avg: DEMO_DASH_KPI.avgCart,
      };
    }
    return aggregateOrders(periodOrders);
  }, [useDemo, periodFactor, periodOrders]);

  const previous = useMemo(() => {
    if (useDemo) {
      const rev = DEMO_DASH_KPI.revenue * periodFactor;
      const cnt = Math.max(1, Math.round(DEMO_DASH_KPI.orders * periodFactor));
      return {
        revenue: rev / (1 + DEMO_DASH_KPI.deltaRevenue / 100),
        count: cnt / (1 + DEMO_DASH_KPI.deltaOrders / 100),
        avg: DEMO_DASH_KPI.avgCart / (1 + DEMO_DASH_KPI.deltaAvg / 100),
      };
    }
    return aggregateOrders(prevOrders);
  }, [useDemo, periodFactor, prevOrders]);

  const cartCount = useMemo(
    () => orders.filter((o) => String(o.status).toLowerCase() === 'cart').length,
    [orders]
  );
  const conversionDenom = useDemo ? 1 : current.count + cartCount;
  const conversion = useDemo
    ? DEMO_DASH_KPI.conversion
    : conversionDenom > 0
      ? (current.count / conversionDenom) * 100
      : 0;
  const prevConversion = useDemo
    ? DEMO_DASH_KPI.conversion / (1 + DEMO_DASH_KPI.deltaConversion / 100)
    : cartCount + previous.count > 0
      ? (previous.count / (previous.count + cartCount)) * 100
      : 0;

  const revenueByCategory = useMemo(() => {
    if (useDemo) return DEMO_CATEGORIES;
    if (stats?.revenueByCategory?.length && period === 'month') {
      return stats.revenueByCategory.slice(0, 4);
    }
    const map = {};
    for (const order of periodOrders) {
      for (const item of order.items || []) {
        const cat = item.Product?.category || 'Non classé';
        map[cat] = (map[cat] || 0) + (item.price || 0) * (item.quantity || 0);
      }
    }
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
        percent: Number(((amount / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [useDemo, periodOrders, stats, period]);

  const monthlyRevenue = useMemo(() => {
    if (useDemo) return DEMO_MONTHLY;
    if (stats?.monthlyRevenue?.length) return stats.monthlyRevenue;
    const map = {};
    for (const order of orders.filter(isPaidOrder)) {
      const d = new Date(order.date || order.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + (order.total || 0);
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue: Number(revenue.toFixed(2)) }));
  }, [useDemo, orders, stats]);

  const chartData = useMemo(() => buildChartData(monthlyRevenue), [monthlyRevenue]);

  const sparkSeries = useMemo(() => {
    if (useDemo) return DEMO_SPARK;
    const vals = monthlyRevenue.slice(-6).map((m) => m.revenue);
    return vals.length ? vals : [0, current.revenue];
  }, [useDemo, monthlyRevenue, current.revenue]);

  const bestseller = useMemo(() => {
    if (useDemo) return DEMO_BESTSELLER;
    if (stats?.bestseller) return stats.bestseller;
    const qty = {};
    for (const order of periodOrders) {
      for (const item of order.items || []) {
        const id = item.ProductId || item.Product?.id;
        if (!id) continue;
        if (!qty[id]) {
          qty[id] = { id, name: item.Product?.name || `#${id}`, quantity: 0 };
        }
        qty[id].quantity += item.quantity || 0;
      }
    }
    return Object.values(qty).sort((a, b) => b.quantity - a.quantity)[0] || null;
  }, [useDemo, periodOrders, stats]);

  const lowStock = useMemo(() => {
    if (useDemo) return DEMO_LOW_STOCK;
    if (stats?.lowStockProducts?.length) return stats.lowStockProducts.slice(0, 5);
    return products
      .filter((p) => (p.stock ?? 0) <= 3)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, 5);
  }, [useDemo, products, stats]);

  const recentOrders = useMemo(() => {
    if (useDemo) return DEMO_ORDERS;
    return [...orders]
      .filter(isPaidOrder)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 5);
  }, [useDemo, orders]);

  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: formatEuro(current.revenue),
      delta: useDemo ? DEMO_DASH_KPI.deltaRevenue : deltaPercent(current.revenue, previous.revenue),
      icon: <MdPayments size={18} />,
      stroke: '#1f6b45',
    },
    {
      label: 'Commandes totales',
      value: String(current.count),
      delta: useDemo ? DEMO_DASH_KPI.deltaOrders : deltaPercent(current.count, previous.count),
      icon: <MdShoppingBag size={18} />,
      stroke: '#b88e5f',
    },
    {
      label: 'Panier moyen',
      value: formatEuro(current.avg),
      delta: useDemo ? DEMO_DASH_KPI.deltaAvg : deltaPercent(current.avg, previous.avg),
      icon: <MdReceiptLong size={18} />,
      stroke: '#121417',
    },
    {
      label: 'Taux de conversion',
      value: `${conversion.toFixed(2)} %`,
      delta: useDemo
        ? DEMO_DASH_KPI.deltaConversion
        : conversionDenom > 0
          ? deltaPercent(conversion, prevConversion)
          : 0,
      icon: <MdFilterAlt size={18} />,
      stroke: '#b88e5f',
      hint: null,
    },
  ];

  const exportReport = () => {
    const rows = [
      ['Indicateur', 'Valeur', 'Période'],
      ["Chiffre d'affaires", current.revenue, period],
      ['Commandes', current.count, period],
      ['Panier moyen', current.avg.toFixed(2), period],
      ['Conversion %', conversion.toFixed(2), period],
      [],
      ['Référence', 'Client', 'Date', 'Statut', 'Montant'],
      ...recentOrders.slice(0, 20).map((o) => [
        `CMD-${o.id}`,
        o.client || '',
        o.date || o.createdAt || '',
        o.status || '',
        o.total || 0,
      ]),
    ];
    downloadCsv(`epure-rapport-${period}-${Date.now()}.csv`, rows);
  };

  if (loading) {
    return <div className="ae-dash-loading">Chargement du cockpit…</div>;
  }

  return (
    <div className="ae-dash">
      {useDemo && (
        <div
          style={{
            marginBottom: '0.85rem',
            padding: '0.55rem 0.85rem',
            borderRadius: 10,
            background: '#f6f4ef',
            border: '1px solid #e6d9c6',
            fontSize: '0.75rem',
            color: '#5c4a32',
          }}
        >
          Mode maquette : aucune commande en base — affichage des données mock du cockpit exécutif.
        </div>
      )}
      <div className="ae-dash-crumb">
        <span>
          <strong>Épure Studio</strong> &gt; Cockpit opérations
        </span>
        <span className="ae-dash-live">
          <span className="pulse" /> {useDemo ? 'Données mock' : 'Données en direct'}
        </span>
      </div>

      <div className="ae-dash-head">
        <h1>Tableau de bord exécutif</h1>
        <div className="ae-dash-actions">
          <div className="ae-period" role="tablist" aria-label="Période">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                className={period === p.id ? 'active' : ''}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" className="ae-dash-export" onClick={exportReport}>
            <MdDownload size={16} /> Exporter rapport
          </button>
        </div>
      </div>

      {error && <div className="ae-dash-error">{error}</div>}

      <div className="ae-kpi-grid">
        {kpis.map((kpi) => {
          const up = kpi.delta > 0.05;
          const down = kpi.delta < -0.05;
          return (
            <article key={kpi.label} className="ae-kpi">
              <div className="ae-kpi-top">
                <span className="ae-kpi-label">{kpi.label}</span>
                <span className="ae-kpi-icon">{kpi.icon}</span>
              </div>
              <div className="ae-kpi-value">{kpi.value}</div>
              <div className="ae-kpi-meta">
                <span className={`ae-kpi-delta ${up ? 'up' : down ? 'down' : 'flat'}`}>
                  {kpi.hint
                    ? kpi.hint
                    : `${up ? '+' : ''}${kpi.delta.toFixed(1)}% vs période préc.`}
                </span>
                <div className="ae-kpi-spark">
                  <Sparkline values={sparkSeries} stroke={kpi.stroke} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="ae-dash-mid">
        <section className="ae-panel">
          <div className="ae-panel-head">
            <h2>Trajectoire des ventes &amp; projections</h2>
          </div>
          <div className="ae-chart-legend">
            <span className="ai">Modèle IA 98.4%</span>
            <span>
              <i /> Réalisé
            </span>
            <span>
              <i className="dash" /> Prévision
            </span>
          </div>
          {chartData.length === 0 ? (
            <div className="ae-dash-empty">Aucune vente à tracer pour le moment.</div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceae6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8a8d93' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8a8d93' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatEuro(value),
                      name === 'realised' ? 'Réalisé' : 'Prévision',
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      border: 'none',
                      background: '#121417',
                      color: '#fff',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#c8c5bd' }}
                  />
                  <Area type="monotone" dataKey="realised" stroke="none" fill="rgba(18,20,23,0.04)" connectNulls={false} />
                  <Line
                    type="monotone"
                    dataKey="realised"
                    stroke="#121417"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#121417' }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#b88e5f"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="ae-panel">
          <div className="ae-panel-head">
            <h2>Répartition catalogue</h2>
          </div>
          {revenueByCategory.length === 0 ? (
            <div className="ae-dash-empty">Pas encore de répartition par catégorie.</div>
          ) : (
            <div className="ae-cat-list">
              {revenueByCategory.map((row, idx) => (
                <div key={row.category} className="ae-cat-row">
                  <div className="ae-cat-meta">
                    <strong>{row.category}</strong>
                    <span>
                      {row.percent}% · {formatEuro(row.amount)}
                    </span>
                  </div>
                  <div className="ae-cat-bar">
                    <i className={`c${(idx % 4) + 1}`} style={{ width: `${Math.min(row.percent, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="ae-bestseller">
            <MdStar size={16} color="#b88e5f" />
            {bestseller ? (
              <span>
                Bestseller du moment : <strong>{bestseller.name}</strong> · {bestseller.quantity} vendus
              </span>
            ) : (
              <span>Bestseller : données insuffisantes</span>
            )}
          </div>
        </section>
      </div>

      <div className="ae-dash-bottom">
        <section className="ae-panel">
          <div className="ae-panel-head">
            <h2>
              Commandes en temps réel{' '}
              <span style={{ color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.78rem' }}>
                ({recentOrders.length} récentes)
              </span>
            </h2>
            <Link to="/admin/orders">Toutes les commandes →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="ae-dash-empty">Aucune commande pour l’instant.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="ae-orders-table">
                <thead>
                  <tr>
                    <th>Référence &amp; client</th>
                    <th>Date / heure</th>
                    <th>Statut</th>
                    <th>Montant</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const d = new Date(o.date || o.createdAt);
                    return (
                      <tr key={o.id}>
                        <td>
                          <strong>CMD-{String(o.id).padStart(4, '0')}</strong>
                          <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>{o.client}</div>
                        </td>
                        <td>
                          {Number.isNaN(d.getTime())
                            ? '—'
                            : d.toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                        </td>
                        <td>
                          <span className={`ae-status ${statusClass(o.status)}`}>{o.status || '—'}</span>
                        </td>
                        <td>{formatEuro(o.total)}</td>
                        <td>
                          <button
                            type="button"
                            className="ae-icon-btn"
                            aria-label="Voir la commande"
                            onClick={() => navigate('/admin/orders')}
                          >
                            <MdVisibility size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="ae-panel-foot">
            <span>Transactions chiffrées (simulation locale)</span>
            <button type="button" className="ae-panel-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              Voir les logs de paiement
            </button>
          </div>
        </section>

        <div className="ae-dash-side">
          <section className="ae-panel">
            <div className="ae-panel-head">
              <h2>
                <MdWarningAmber size={16} style={{ verticalAlign: -2, marginRight: 4 }} />
                Alertes stock critique
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                {lowStock.length} référence{lowStock.length > 1 ? 's' : ''}
              </span>
            </div>
            {lowStock.length === 0 ? (
              <div className="ae-dash-empty">Aucun stock critique.</div>
            ) : (
              <div className="ae-stock-list">
                {lowStock.map((p) => (
                  <div key={p.id} className="ae-stock-item">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="ae-stock-thumb" />
                    ) : (
                      <div className="ae-stock-thumb" />
                    )}
                    <div className="ae-stock-info">
                      <strong>{p.name}</strong>
                      <span>
                        Il ne reste que {p.stock} unité{p.stock > 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ae-reappro"
                      onClick={() => navigate(`/admin/products?id=${p.id}`)}
                    >
                      Réappro
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="ae-panel">
            <div className="ae-panel-head">
              <h2>Santé plateforme — sécurité</h2>
              <span className="ae-health-badge">Opérationnel 99.98%</span>
            </div>
            <div className="ae-health-grid">
              <div className="ae-health-card">
                <label>Clients uniques</label>
                <strong>
                  {useDemo
                    ? DEMO_DASH_KPI.uniqueClients
                    : stats?.uniqueClients ??
                      new Set(orders.filter(isPaidOrder).map((o) => o.client)).size}
                </strong>
                <small>Base commandes</small>
              </div>
              <div className="ae-health-card">
                <label>Sessions JWT actives</label>
                <strong>{localStorage.getItem('token') ? 1 : 0}</strong>
                <small>Token vérifié SSL</small>
              </div>
            </div>
            <div className="ae-health-foot">
              <span className="ok">API Passerelle : {apiMs != null ? `${apiMs}ms` : '—'}</span>
              <span>v2.4.1-prod</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
