import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdAssignment,
  MdCheckCircle,
  MdClose,
  MdDownload,
  MdLocalShipping,
  MdPrint,
  MdSearch,
  MdSentimentSatisfiedAlt,
  MdShield,
  MdTrendingUp,
  MdAdd,
} from 'react-icons/md';
import { getOrders, updateOrder } from '../../services/ordersApi';
import {
  DEMO_ORDERS_KPI,
  DEMO_ORDERS_LIST,
  DEMO_TAB_COUNTS,
} from '../../data/ordersDemo';
import '../../styles/orders.css';

const TABS = [
  { key: 'all', label: 'Toutes les commandes' },
  { key: 'prepare', label: 'À préparer' },
  { key: 'transit', label: 'En transit' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'return', label: 'Retours/Litiges' },
  { key: 'cancelled', label: 'Annulées' },
];

const CARRIERS = ['Tous transporteurs', 'Geodis Art & Convoi', 'Chronopost', 'Colissimo'];
const PAGE_SIZE = 6;

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}€`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusKeyFromRaw(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('annul') || s.includes('rembours')) return 'cancelled';
  if (s.includes('retour') || s.includes('litige')) return 'return';
  if (s.includes('livr')) return 'delivered';
  if (s.includes('expéd') || s.includes('exped') || s.includes('transit')) return 'transit';
  if (s.includes('prépar') || s.includes('prepar') || s.includes('valid') || s.includes('cours')) {
    return 'prepare';
  }
  return 'prepare';
}

function statusLabel(key) {
  const map = {
    prepare: 'En préparation',
    transit: 'En transit',
    delivered: 'Livrée',
    return: 'Retour / Litige',
    cancelled: 'Annulée',
  };
  return map[key] || key;
}

function nextStatus(key) {
  if (key === 'prepare') return { key: 'transit', label: 'En transit', api: 'Expédiée' };
  if (key === 'transit') return { key: 'delivered', label: 'Livrée', api: 'Livrée' };
  return null;
}

function buildPageItems(current, total) {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '…', total];
  if (current >= total - 2) return [1, '…', total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

function enrichApiOrder(o) {
  const items = o.items || [];
  const first = items[0];
  const product = first?.Product;
  const nameParts = items.map((it) => {
    const n = it.Product?.name || it.name || 'Article';
    return it.quantity > 1 ? `${n} ×${it.quantity}` : n;
  });
  const key = statusKeyFromRaw(o.status);
  const clientEmail = o.client || 'client@mail.com';
  const displayName = clientEmail.includes('@')
    ? clientEmail.split('@')[0].replace(/[._]/g, ' ')
    : clientEmail;

  return {
    id: o.id,
    ref: `#EP-${String(o.id).padStart(4, '0')}`,
    date: o.date || o.createdAt,
    client: {
      name: displayName.replace(/\b\w/g, (c) => c.toUpperCase()),
      email: clientEmail,
      phone: '—',
      city: '—',
      type: null,
      crmId: null,
      address: 'Adresse non renseignée',
    },
    piecesLabel: nameParts.slice(0, 2).join(' + ') || '—',
    piecesThumb: product?.image_url || null,
    shipping: 'Standard atelier',
    carrier: 'Geodis Art & Convoi',
    tracking: null,
    slot: null,
    total: o.total || 0,
    payment: 'Réglé',
    status: statusLabel(key),
    statusKey: key,
    urgent: key === 'prepare',
    items: items.map((it) => ({
      name: it.Product?.name || it.name || 'Article',
      sku: `EP-${String(it.ProductId || it.id || 0).padStart(3, '0')}`,
      qty: it.quantity || 1,
      price: it.price || 0,
      image_url: it.Product?.image_url || null,
    })),
    subtotal: o.total || 0,
    shippingFee: 0,
    shippingNote: null,
    vat: 0,
    history: [
      {
        label: 'Commande créée',
        date: formatDateTime(o.date || o.createdAt),
        done: true,
      },
      { label: `Statut : ${o.status}`, date: '—', done: true },
    ],
    _demo: false,
  };
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [raw, setRaw] = useState([]);
  const [useDemo, setUseDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState(() => searchParams.get('q') || '');
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [selected, setSelected] = useState(new Set());
  const [activeId, setActiveId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const param = searchParams.get('q');
    if (param != null) setQ(param);
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeId]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOrders();
      const list = (res.data || []).filter((o) => o.status !== 'cart');
      if (!list.length) {
        setUseDemo(true);
        setRaw(DEMO_ORDERS_LIST);
      } else {
        setUseDemo(false);
        setRaw(list.map(enrichApiOrder));
      }
    } catch (err) {
      setUseDemo(true);
      setRaw(DEMO_ORDERS_LIST);
      setError(err.response?.data?.message || err.message || 'API indisponible — mode démo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    if (useDemo) return DEMO_TAB_COUNTS;
    const c = { all: raw.length, prepare: 0, transit: 0, delivered: 0, return: 0, cancelled: 0 };
    raw.forEach((o) => {
      if (c[o.statusKey] !== undefined) c[o.statusKey] += 1;
    });
    return c;
  }, [raw, useDemo]);

  const kpi = useMemo(() => {
    if (useDemo) return DEMO_ORDERS_KPI;
    const prepare = raw.filter((o) => o.statusKey === 'prepare');
    return {
      toProcess: prepare.length,
      urgent: prepare.filter((o) => o.urgent).length,
      inTransit: raw.filter((o) => o.statusKey === 'transit').length,
      deliveredMonth: raw.filter((o) => o.statusKey === 'delivered').length,
      deliveredDelta: 0,
      compliance: 99.4,
    };
  }, [raw, useDemo]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return raw.filter((o) => {
      if (tab !== 'all' && o.statusKey !== tab) return false;
      if (carrier !== CARRIERS[0] && o.carrier !== carrier) return false;
      if (!needle) return true;
      const hay = [
        o.ref,
        o.client?.name,
        o.client?.email,
        o.piecesLabel,
        ...(o.items || []).map((i) => i.sku),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [raw, tab, q, carrier]);

  useEffect(() => {
    setPage(1);
  }, [tab, q, carrier]);

  const totalCount = useMemo(() => {
    if (useDemo && tab === 'all' && !q.trim() && carrier === CARRIERS[0]) {
      return DEMO_TAB_COUNTS.all;
    }
    return filtered.length;
  }, [useDemo, tab, q, carrier, filtered.length]);

  const realPageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const demoPager =
    useDemo && tab === 'all' && !q.trim() && carrier === CARRIERS[0] && filtered.length <= PAGE_SIZE;
  const pageCount = demoPager ? 12 : realPageCount;
  const currentPage = Math.min(page, pageCount);

  const pageItems = useMemo(() => {
    if (demoPager && currentPage > 1) return [];
    const start = (Math.min(currentPage, realPageCount) - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage, demoPager, realPageCount]);

  const from = pageItems.length === 0 ? 0 : (Math.min(currentPage, realPageCount) - 1) * PAGE_SIZE + 1;
  const to = from === 0 ? 0 : from + pageItems.length - 1;
  const pageButtons = demoPager ? [1, 2, 3, '…', 12] : buildPageItems(currentPage, pageCount);

  const goToPage = (n) => {
    if (demoPager && n > 1) {
      setToast('Échantillon démo — données sur la page 1 uniquement');
      setPage(1);
      return;
    }
    setPage(n);
  };

  const active = useMemo(
    () => raw.find((o) => o.id === activeId) || null,
    [raw, activeId]
  );

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (pageItems.length && pageItems.every((o) => selected.has(o.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageItems.forEach((o) => next.delete(o.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageItems.forEach((o) => next.add(o.id));
        return next;
      });
    }
  };

  const applyStatus = async (order, next) => {
    if (!next) return;
    if (order._demo || useDemo) {
      setRaw((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                statusKey: next.key,
                status: next.label,
                history: [
                  ...o.history,
                  {
                    label: next.label,
                    date: new Date().toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    done: true,
                  },
                ],
              }
            : o
        )
      );
      setToast(`Commande ${order.ref} → ${next.label}`);
      return;
    }
    try {
      await updateOrder(order.id, { status: next.api });
      setRaw((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                statusKey: next.key,
                status: next.label,
                history: [
                  ...o.history,
                  { label: next.label, date: formatDateTime(new Date()), done: true },
                ],
              }
            : o
        )
      );
      setToast(`Commande ${order.ref} → ${next.label}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Mise à jour impossible');
    }
  };

  const printSlip = (order) => {
    const win = window.open('', '', 'width=800,height=700');
    if (!win) return;
    win.document.write('<html><head><title>Bordereau</title></head><body>');
    win.document.write(`<h2>Bordereau ${order.ref}</h2>`);
    win.document.write(`<p><b>Client :</b> ${order.client.name}</p>`);
    win.document.write('<ul>');
    (order.items || []).forEach((item) => {
      win.document.write(
        `<li>${item.name} (${item.sku}) — ${item.price} € × ${item.qty}</li>`
      );
    });
    win.document.write('</ul>');
    win.document.write(`<p><b>Total :</b> ${formatEuro(order.total)}</p>`);
    win.document.write(`<p><b>Statut :</b> ${order.status}</p>`);
    win.document.write('</body></html>');
    win.print();
    win.close();
  };

  const exportCsv = () => {
    const rows = [
      ['Ref', 'Date', 'Client', 'Total', 'Statut', 'Transporteur'],
      ...filtered.map((o) => [
        o.ref,
        o.date,
        o.client.name,
        o.total,
        o.status,
        o.carrier,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commandes-epure.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ae-ord">
      <div className="ae-ord-crumb">
        Administration boutique <span className="accent">/ Flux &amp; logistique</span>
      </div>

      <div className="ae-ord-head">
        <div>
          <h1>Gestion des Commandes &amp; Logistique</h1>
          <p className="ae-ord-sub">
            Préparation atelier, acheminements et suivi de conformité.
          </p>
        </div>
        <div className="ae-ord-actions">
          <button type="button" className="ae-ord-btn" onClick={exportCsv}>
            <MdDownload size={16} /> Exporter (.CSV / XLSX)
          </button>
          <button
            type="button"
            className="ae-ord-btn"
            disabled={!selected.size}
            onClick={() => {
              const list = raw.filter((o) => selected.has(o.id));
              list.forEach(printSlip);
              setToast(`${list.length} bordereau(x) généré(s)`);
            }}
          >
            <MdPrint size={16} /> Bordereaux groupés
          </button>
          <button
            type="button"
            className="ae-ord-btn primary"
            onClick={() => navigate('/admin/orders/new')}
          >
            <MdAdd size={16} /> Créer une commande manuelle
          </button>
        </div>
      </div>

      {useDemo && (
        <div className="ae-ord-demo">
          Mode démo maquette — les commandes API sont vides ou indisponibles. Les actions restent
          locales.
        </div>
      )}
      {error && !useDemo && <div className="ae-ord-error">{error}</div>}
      {toast && <div className="ae-ord-toast">{toast}</div>}

      <div className="ae-ord-kpis">
        <div className="ae-ord-kpi">
          <div className="ae-ord-kpi-ico">
            <MdAssignment size={18} />
          </div>
          <label>Commandes à Traiter</label>
          <div className="ae-ord-kpi-row">
            <strong>{kpi.toProcess}</strong>
            <span className="unit">en atelier</span>
          </div>
          <span className="ae-ord-kpi-pill warn">
            <span className="dot" aria-hidden />
            {kpi.urgent} urgentes / Expédition J+0
          </span>
        </div>

        <div className="ae-ord-kpi">
          <div className="ae-ord-kpi-ico">
            <MdLocalShipping size={18} />
          </div>
          <label>En Transit / Acheminement</label>
          <div className="ae-ord-kpi-row">
            <strong>{kpi.inTransit}</strong>
            <span className="unit">convois actifs</span>
          </div>
          <div className="ae-ord-kpi-foot">
            <MdShield size={14} aria-hidden />
            Geodis Art &amp; Convoi d&apos;art certifié
          </div>
        </div>

        <div className="ae-ord-kpi">
          <div className="ae-ord-kpi-ico">
            <MdCheckCircle size={18} />
          </div>
          <label>Livrées ce mois</label>
          <div className="ae-ord-kpi-row">
            <strong>{kpi.deliveredMonth}</strong>
            <span className="unit">pièces réceptionnées</span>
          </div>
          <div className="ae-ord-kpi-foot up">
            <MdTrendingUp size={14} aria-hidden />
            {kpi.deliveredDelta > 0
              ? `+${kpi.deliveredDelta}% vs mois précédent (M-1)`
              : 'vs mois précédent (M-1)'}
          </div>
        </div>

        <div className="ae-ord-kpi">
          <div className="ae-ord-kpi-ico">
            <MdSentimentSatisfiedAlt size={18} />
          </div>
          <label>Taux de Conformité</label>
          <div className="ae-ord-kpi-row">
            <strong>{kpi.compliance}%</strong>
            <span className="unit">sans réserve</span>
          </div>
          <span className="ae-ord-kpi-pill ok">Protocole Gants Blancs respecté</span>
        </div>
      </div>

      <div className="ae-ord-layout">
        <div className="ae-ord-panel">
          <div className="ae-ord-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`ae-ord-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="cnt">({counts[t.key] ?? 0})</span>
              </button>
            ))}
          </div>

          <div className="ae-ord-filters">
            <div className="ae-ord-search">
              <MdSearch size={18} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par réf, client, SKU…"
              />
            </div>
            <select
              className="ae-ord-select"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            >
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select className="ae-ord-select" defaultValue="month">
              <option value="month">Ce mois</option>
              <option value="week">Cette semaine</option>
              <option value="all">Tout</option>
            </select>
            <button
              type="button"
              className="ae-ord-btn"
              disabled={!selected.size}
              onClick={() => setToast(`${selected.size} commande(s) sélectionnée(s)`)}
            >
              Actions groupées
            </button>
          </div>

          {loading ? (
            <p className="ae-ord-empty">Chargement des commandes…</p>
          ) : (
            <>
              <div className="ae-ord-table-wrap">
                <table className="ae-ord-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          className="ae-ord-check"
                          checked={
                            pageItems.length > 0 && pageItems.every((o) => selected.has(o.id))
                          }
                          onChange={toggleAll}
                          aria-label="Tout sélectionner"
                        />
                      </th>
                      <th>Commandes &amp; Date</th>
                      <th>Client</th>
                      <th>Pièces</th>
                      <th>Acheminement</th>
                      <th>Total TTC</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((o) => (
                      <tr
                        key={o.id}
                        className={activeId === o.id ? 'selected' : ''}
                        onClick={() => setActiveId(o.id)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            className="ae-ord-check"
                            checked={selected.has(o.id)}
                            onChange={(e) => toggleSelect(o.id, e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          <div className="ae-ord-ref">
                            <strong>{o.ref}</strong>
                            <span>{formatDateTime(o.date)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="ae-ord-client">
                            <strong>{o.client.name}</strong>
                            <div className="meta">
                              {o.client.type === 'VIP' && (
                                <span className="ae-ord-badge vip">VIP</span>
                              )}
                              {o.client.type === 'PRO' && (
                                <span className="ae-ord-badge pro">PRO B2B</span>
                              )}
                              <span>{o.client.city}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ae-ord-pieces">
                            {o.piecesThumb ? (
                              <img src={o.piecesThumb} alt="" />
                            ) : (
                              <img
                                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23f0efec' width='40' height='40'/%3E%3C/svg%3E"
                                alt=""
                              />
                            )}
                            <span>{o.piecesLabel}</span>
                          </div>
                        </td>
                        <td>
                          <div className="ae-ord-ship">{o.shipping}</div>
                        </td>
                        <td>
                          <div className="ae-ord-total">
                            <strong>{formatEuro(o.total)}</strong>
                            <span>{o.payment}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`ae-ord-status ${o.statusKey}`}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                    {!pageItems.length && (
                      <tr>
                        <td colSpan={7}>
                          <div className="ae-ord-empty">Aucune commande pour ce filtre.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ae-ord-pager">
                <p className="ae-ord-pager-info">
                  Affichage de <strong>{from || 0}</strong> à <strong>{to || 0}</strong> sur{' '}
                  <strong>{totalCount}</strong> commandes
                </p>
                <div className="ae-ord-pager-nav" role="navigation" aria-label="Pagination">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                    aria-label="Page précédente"
                  >
                    ‹
                  </button>
                  {pageButtons.map((n, i) =>
                    n === '…' ? (
                      <span key={`e${i}`} className="ae-ord-pager-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        className={n === currentPage ? 'active' : ''}
                        onClick={() => goToPage(n)}
                        aria-current={n === currentPage ? 'page' : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    disabled={!demoPager && currentPage >= pageCount}
                    onClick={() => goToPage(currentPage + 1)}
                    aria-label="Page suivante"
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      {active &&
        createPortal(
          <div className="ae-ord-modal-root" role="presentation">
            <button
              type="button"
              className="ae-ord-modal-backdrop"
              aria-label="Fermer le détail"
              onClick={() => setActiveId(null)}
            />
            <aside
              className="ae-ord-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ae-ord-modal-title"
            >
              <div className="ae-ord-modal-scroll">
                <div className="ae-ord-modal-top">
                  <button
                    type="button"
                    className="ae-ord-modal-close"
                    onClick={() => setActiveId(null)}
                    aria-label="Fermer"
                  >
                    <MdClose size={20} />
                  </button>
                  <h2 id="ae-ord-modal-title">{active.ref}</h2>
                  <p className="ae-ord-modal-sub">
                    {active.client.name}
                    {active.client.city && active.client.city !== '—'
                      ? ` · ${active.client.city}`
                      : ''}
                    {active.client.crmId ? ` · ${active.client.crmId}` : ''}
                  </p>
                  <div className={`ae-ord-modal-banner ${active.statusKey}`}>
                    <span className="dot" aria-hidden />
                    {active.status}
                    {active.urgent ? ' · Urgent atelier' : ''}
                    {active.tracking ? ` · Suivi ${active.tracking}` : ''}
                  </div>
                </div>

                <section className="ae-ord-modal-block">
                  <h3>Client &amp; destination</h3>
                  <dl className="ae-ord-kv">
                    <div>
                      <dt>Nom</dt>
                      <dd>{active.client.name}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{active.client.email}</dd>
                    </div>
                    <div>
                      <dt>Téléphone</dt>
                      <dd>{active.client.phone}</dd>
                    </div>
                    <div>
                      <dt>Adresse</dt>
                      <dd className="ae-ord-kv-multiline">{active.client.address}</dd>
                    </div>
                    {active.client.type && (
                      <div>
                        <dt>Segment</dt>
                        <dd>
                          <span
                            className={`ae-ord-badge ${
                              active.client.type === 'VIP' ? 'vip' : 'pro'
                            }`}
                          >
                            {active.client.type === 'PRO' ? 'PRO B2B' : active.client.type}
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                  <Link to="/admin/clients" className="ae-ord-modal-link">
                    {active.client.crmId
                      ? `Ouvrir fiche CRM ${active.client.crmId} →`
                      : 'Voir les clients →'}
                  </Link>
                </section>

                <section className="ae-ord-modal-block">
                  <h3>Articles commandés</h3>
                  {(active.items || []).map((item, i) => (
                    <div className="ae-ord-item-row" key={`${item.sku}-${i}`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt="" />
                      ) : (
                        <img
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect fill='%23f0efec' width='44' height='44'/%3E%3C/svg%3E"
                          alt=""
                        />
                      )}
                      <div className="info">
                        <strong>{item.name}</strong>
                        <span>
                          {item.sku} · ×{item.qty}
                        </span>
                      </div>
                      <div className="price">{formatEuro(item.price * item.qty)}</div>
                    </div>
                  ))}
                </section>

                <section className="ae-ord-modal-block">
                  <h3>Récapitulatif financier</h3>
                  <dl className="ae-ord-kv">
                    <div>
                      <dt>Sous-total</dt>
                      <dd>{formatEuro(active.subtotal)}</dd>
                    </div>
                    <div>
                      <dt>Livraison</dt>
                      <dd>
                        {active.shippingNote ||
                          (active.shippingFee ? formatEuro(active.shippingFee) : '—')}
                      </dd>
                    </div>
                    {active.vat > 0 && (
                      <div>
                        <dt>TVA</dt>
                        <dd>{formatEuro(active.vat)}</dd>
                      </div>
                    )}
                    <div className="ae-ord-kv-total">
                      <dt>Total TTC</dt>
                      <dd>{formatEuro(active.total)}</dd>
                    </div>
                    <div>
                      <dt>Paiement</dt>
                      <dd>{active.payment}</dd>
                    </div>
                  </dl>
                </section>

                <section className="ae-ord-modal-block">
                  <h3>Logistique</h3>
                  <dl className="ae-ord-kv">
                    <div>
                      <dt>Acheminement</dt>
                      <dd>{active.shipping}</dd>
                    </div>
                    <div>
                      <dt>Transporteur</dt>
                      <dd>{active.carrier}</dd>
                    </div>
                    <div>
                      <dt>N° de suivi</dt>
                      <dd>{active.tracking || '—'}</dd>
                    </div>
                    <div>
                      <dt>Créneau</dt>
                      <dd>{active.slot || 'À planifier'}</dd>
                    </div>
                  </dl>
                </section>

                {active.urgent && (
                  <div className="ae-ord-modal-alert">
                    <strong>Priorité atelier</strong>
                    <p>Expédition J+0 demandée — préparer pour enlèvement dès que possible.</p>
                  </div>
                )}

                <section className="ae-ord-modal-block">
                  <h3>Historique &amp; traçabilité</h3>
                  <ul className="ae-ord-modal-log">
                    {(active.history || []).map((h, i) => (
                      <li key={i}>
                        <span className="when">{h.date}</span>
                        <span className="what">{h.label}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="ae-ord-modal-footer">
                <div className="ae-ord-modal-footer-row">
                  <button type="button" className="ae-ord-btn" onClick={() => printSlip(active)}>
                    <MdPrint size={16} /> Bordereau
                  </button>
                  {nextStatus(active.statusKey) ? (
                    <button
                      type="button"
                      className="ae-ord-btn primary"
                      onClick={() => applyStatus(active, nextStatus(active.statusKey))}
                    >
                      {active.statusKey === 'prepare'
                        ? 'Prêt pour enlèvement'
                        : 'Marquer livrée'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ae-ord-btn primary"
                      onClick={() => setActiveId(null)}
                    >
                      Fermer
                    </button>
                  )}
                </div>
                {active.statusKey !== 'cancelled' && active.statusKey !== 'return' && (
                  <button
                    type="button"
                    className="ae-ord-btn danger"
                    onClick={() => {
                      applyStatus(active, {
                        key: 'cancelled',
                        label: 'Annulée',
                        api: 'Annulée',
                      });
                    }}
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </aside>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
}
