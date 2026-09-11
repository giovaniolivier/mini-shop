import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdClose,
  MdDownload,
  MdGroups,
  MdPersonAddAlt1,
  MdSearch,
  MdStorefront,
  MdTrendingUp,
  MdWorkspacePremium,
} from 'react-icons/md';
import { getClients } from '../../services/clientsApi';
import {
  DEMO_CLIENTS_KPI,
  DEMO_CLIENTS_LIST,
  DEMO_CLIENT_TAB_COUNTS,
} from '../../data/clientsDemo';
import '../../styles/clients.css';

const TABS = [
  { key: 'all', label: 'Tous les clients' },
  { key: 'vip', label: 'VIP' },
  { key: 'pro', label: 'PRO B2B' },
  { key: 'nouveau', label: 'Nouveaux' },
  { key: 'litige', label: 'Litiges' },
];

const PAGE_SIZE = 8;

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('litige')) return 'litige';
  if (s.includes('nouveau')) return 'nouveau';
  if (s.includes('inactif')) return 'inactif';
  return 'actif';
}

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function normalizeClient(c) {
  return {
    ...c,
    id: c.id,
    crmId: c.crmId || `CL-${String(c.id).padStart(4, '0')}`,
    name: c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email,
    email: c.email || '',
    phone: c.phone || '—',
    city: c.city || '—',
    type: c.type || null,
    address: c.address || 'Adresse non renseignée',
    registered: c.registered || c.createdAt || null,
    ordersCount: Number(c.ordersCount ?? c.orders ?? 0),
    totalSpent: Number(c.totalSpent ?? 0),
    lastOrderAt: c.lastOrderAt || null,
    lastOrderRef: c.lastOrderRef || null,
    status: c.status || (Number(c.ordersCount || c.orders || 0) ? 'Actif' : 'Nouveau'),
    newsletter: Boolean(c.newsletter),
    notes: c.notes || '',
    recentOrders: c.recentOrders || [],
  };
}

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '…', total];
  if (current >= total - 2) return [1, '…', total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

export default function AdminClients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [raw, setRaw] = useState([]);
  const [useDemo, setUseDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState(() => searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState('Toutes villes');
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const param = searchParams.get('q');
    if (param != null) setQ(param);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getClients();
        const list = (res.data || []).map(normalizeClient);
        if (!cancelled) {
          if (!list.length) {
            setUseDemo(true);
            setRaw(DEMO_CLIENTS_LIST.map(normalizeClient));
          } else {
            setUseDemo(false);
            setRaw(list);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setUseDemo(true);
          setRaw(DEMO_CLIENTS_LIST.map(normalizeClient));
          setError(err.response?.data?.message || err.message || 'API indisponible — mode démo');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [tab, q, cityFilter]);

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

  const cities = useMemo(() => {
    const set = new Set(raw.map((c) => c.city).filter((c) => c && c !== '—'));
    return ['Toutes villes', ...Array.from(set).sort()];
  }, [raw]);

  const counts = useMemo(() => {
    if (useDemo) return DEMO_CLIENT_TAB_COUNTS;
    return {
      all: raw.length,
      vip: raw.filter((c) => c.type === 'VIP').length,
      pro: raw.filter((c) => c.type === 'PRO').length,
      nouveau: raw.filter((c) => statusClass(c.status) === 'nouveau' || c.ordersCount === 0).length,
      litige: raw.filter((c) => statusClass(c.status) === 'litige').length,
    };
  }, [raw, useDemo]);

  const kpi = useMemo(() => {
    if (useDemo) return DEMO_CLIENTS_KPI;
    const vip = raw.filter((c) => c.type === 'VIP').length;
    const pro = raw.filter((c) => c.type === 'PRO').length;
    const nouveau = raw.filter((c) => c.ordersCount === 0 || statusClass(c.status) === 'nouveau').length;
    const ca = raw.reduce((s, c) => s + (c.totalSpent || 0), 0);
    return {
      total: raw.length,
      vip,
      pro,
      newMonth: nouveau,
      caMonth: ca,
      activeRate: raw.length
        ? Math.round((raw.filter((c) => statusClass(c.status) === 'actif').length / raw.length) * 100)
        : 0,
    };
  }, [raw, useDemo]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return raw.filter((c) => {
      if (tab === 'vip' && c.type !== 'VIP') return false;
      if (tab === 'pro' && c.type !== 'PRO') return false;
      if (tab === 'nouveau' && !(c.ordersCount === 0 || statusClass(c.status) === 'nouveau')) return false;
      if (tab === 'litige' && statusClass(c.status) !== 'litige') return false;
      if (cityFilter !== 'Toutes villes' && c.city !== cityFilter) return false;
      if (!needle) return true;
      const hay = [c.name, c.email, c.phone, c.crmId, c.city, c.type].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [raw, tab, q, cityFilter]);

  const totalCount =
    useDemo && tab === 'all' && !q.trim() && cityFilter === 'Toutes villes'
      ? DEMO_CLIENT_TAB_COUNTS.all
      : filtered.length;

  const realPageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const demoPager =
    useDemo && tab === 'all' && !q.trim() && cityFilter === 'Toutes villes' && filtered.length <= PAGE_SIZE;
  const pageCount = demoPager ? 16 : realPageCount;
  const currentPage = Math.min(page, pageCount);
  const pageItems = useMemo(() => {
    if (demoPager && currentPage > 1) return filtered.slice(0, PAGE_SIZE);
    const start = (Math.min(currentPage, realPageCount) - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage, demoPager, realPageCount]);

  const from = pageItems.length === 0 ? 0 : (Math.min(currentPage, realPageCount) - 1) * PAGE_SIZE + 1;
  const to = from === 0 ? 0 : from + pageItems.length - 1;
  const pageButtons = demoPager ? [1, 2, 3, '…', 16] : buildPages(currentPage, pageCount);

  const active = useMemo(
    () => raw.find((c) => String(c.id) === String(activeId) || c.crmId === activeId) || null,
    [raw, activeId]
  );

  const goToPage = (n) => {
    if (demoPager && n > 1) {
      setToast('Échantillon démo — données sur la page 1');
      setPage(1);
      return;
    }
    setPage(n);
  };

  const exportCsv = () => {
    const rows = [
      ['CRM', 'Nom', 'Email', 'Téléphone', 'Ville', 'Segment', 'Commandes', 'CA', 'Statut'],
      ...filtered.map((c) => [
        c.crmId,
        c.name,
        c.email,
        c.phone,
        c.city,
        c.type || 'Particulier',
        c.ordersCount,
        c.totalSpent,
        c.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-epure.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ae-cli">
      <div className="ae-cli-crumb">
        Administration boutique <span className="accent">/ Relation client</span>
      </div>

      <div className="ae-cli-head">
        <div>
          <h1>CRM Clients</h1>
          <p className="ae-cli-sub">
            Fiches clients, segments VIP / PRO et historique d’achats Atelier Épure.
          </p>
        </div>
        <div className="ae-cli-actions">
          <button type="button" className="ae-cli-btn" onClick={exportCsv}>
            <MdDownload size={16} /> Exporter (.CSV)
          </button>
          <button
            type="button"
            className="ae-cli-btn primary"
            onClick={() => setToast('Invitation client : bientôt disponible')}
          >
            <MdPersonAddAlt1 size={16} /> Inviter un client
          </button>
        </div>
      </div>

      {useDemo && (
        <div className="ae-cli-demo">
          Mode démo maquette — API clients vide ou indisponible. Les fiches reprennent les clients des
          commandes démo.
        </div>
      )}
      {error && !useDemo && <div className="ae-cli-error">{error}</div>}
      {toast && <div className="ae-cli-toast">{toast}</div>}

      <div className="ae-cli-kpis">
        <div className="ae-cli-kpi">
          <div className="ae-cli-kpi-ico">
            <MdGroups size={18} />
          </div>
          <label>Base clients</label>
          <div className="ae-cli-kpi-row">
            <strong>{kpi.total}</strong>
            <span className="unit">fiches</span>
          </div>
          <div className="sub">{kpi.activeRate}% actifs sur la période</div>
        </div>
        <div className="ae-cli-kpi">
          <div className="ae-cli-kpi-ico">
            <MdWorkspacePremium size={18} />
          </div>
          <label>Clients VIP</label>
          <div className="ae-cli-kpi-row">
            <strong>{kpi.vip}</strong>
            <span className="unit">comptes</span>
          </div>
          <div className="sub">Gants Blancs &amp; priorités atelier</div>
        </div>
        <div className="ae-cli-kpi">
          <div className="ae-cli-kpi-ico">
            <MdStorefront size={18} />
          </div>
          <label>Comptes PRO B2B</label>
          <div className="ae-cli-kpi-row">
            <strong>{kpi.pro}</strong>
            <span className="unit">enseignes</span>
          </div>
          <div className="sub">Galeries, ateliers &amp; résidences</div>
        </div>
        <div className="ae-cli-kpi">
          <div className="ae-cli-kpi-ico">
            <MdTrendingUp size={18} />
          </div>
          <label>CA clients</label>
          <div className="ae-cli-kpi-row">
            <strong>{formatEuro(kpi.caMonth).replace(' €', '')}</strong>
            <span className="unit">€ cumulé</span>
          </div>
          <div className="sub">{kpi.newMonth} nouveaux / sans commande</div>
        </div>
      </div>

      <div className="ae-cli-panel">
        <div className="ae-cli-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`ae-cli-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="cnt">({counts[t.key] ?? 0})</span>
            </button>
          ))}
        </div>

        <div className="ae-cli-filters">
          <div className="ae-cli-search">
            <MdSearch size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher nom, email, CRM, téléphone…"
            />
          </div>
          <select
            className="ae-cli-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="ae-cli-empty">Chargement des clients…</p>
        ) : (
          <>
            <div className="ae-cli-table-wrap">
              <table className="ae-cli-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Ville</th>
                    <th>Segment</th>
                    <th>Commandes</th>
                    <th>CA</th>
                    <th>Dernière cmd</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr
                      key={c.id}
                      className={
                        activeId === c.id || activeId === c.crmId ? 'selected' : ''
                      }
                      onClick={() => setActiveId(c.id)}
                    >
                      <td>
                        <div className="ae-cli-person">
                          <div className="ae-cli-avatar" aria-hidden>
                            {initials(c.name)}
                          </div>
                          <div>
                            <strong>{c.name}</strong>
                            <span>{c.crmId}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="ae-cli-contact">
                          <span>{c.email}</span>
                          <span>{c.phone}</span>
                        </div>
                      </td>
                      <td>{c.city}</td>
                      <td>
                        {c.type === 'VIP' && <span className="ae-cli-badge vip">VIP</span>}
                        {c.type === 'PRO' && <span className="ae-cli-badge pro">PRO B2B</span>}
                        {!c.type && <span className="ae-cli-badge part">Particulier</span>}
                      </td>
                      <td>{c.ordersCount}</td>
                      <td>
                        <strong>{formatEuro(c.totalSpent)}</strong>
                      </td>
                      <td>
                        <div className="ae-cli-contact">
                          <span>{c.lastOrderRef || '—'}</span>
                          <span>{formatDate(c.lastOrderAt)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`ae-cli-status ${statusClass(c.status)}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!pageItems.length && (
                    <tr>
                      <td colSpan={8}>
                        <div className="ae-cli-empty">Aucun client pour ce filtre.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="ae-cli-pager">
              <p className="ae-cli-pager-info">
                Affichage de <strong>{from || 0}</strong> à <strong>{to || 0}</strong> sur{' '}
                <strong>{totalCount}</strong> clients
              </p>
              <div className="ae-cli-pager-nav">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  ‹
                </button>
                {pageButtons.map((n, i) =>
                  n === '…' ? (
                    <span key={`e${i}`} style={{ padding: '0 4px', color: '#9a9da3' }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      className={n === currentPage ? 'active' : ''}
                      onClick={() => goToPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={!demoPager && currentPage >= pageCount}
                  onClick={() => goToPage(currentPage + 1)}
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
          <div className="ae-cli-modal-root" role="presentation">
            <button
              type="button"
              className="ae-cli-modal-backdrop"
              aria-label="Fermer"
              onClick={() => setActiveId(null)}
            />
            <aside className="ae-cli-modal" role="dialog" aria-modal="true">
              <div className="ae-cli-modal-scroll">
                <div className="ae-cli-modal-top">
                  <button
                    type="button"
                    className="ae-cli-modal-close"
                    onClick={() => setActiveId(null)}
                    aria-label="Fermer"
                  >
                    <MdClose size={20} />
                  </button>
                  <h2>{active.name}</h2>
                  <p className="ae-cli-modal-sub">
                    {active.crmId}
                    {active.type ? ` · ${active.type === 'PRO' ? 'PRO B2B' : active.type}` : ''}
                    {active.city && active.city !== '—' ? ` · ${active.city}` : ''}
                  </p>
                  <div className={`ae-cli-modal-banner ${statusClass(active.status)}`}>
                    <span className="dot" aria-hidden />
                    {active.status}
                    {active.newsletter ? ' · Newsletter active' : ''}
                  </div>
                </div>

                <section className="ae-cli-modal-block">
                  <h3>Coordonnées</h3>
                  <dl className="ae-cli-kv">
                    <div>
                      <dt>Email</dt>
                      <dd>{active.email}</dd>
                    </div>
                    <div>
                      <dt>Téléphone</dt>
                      <dd>{active.phone}</dd>
                    </div>
                    <div>
                      <dt>Adresse</dt>
                      <dd className="ae-cli-kv-multi">{active.address}</dd>
                    </div>
                    <div>
                      <dt>Inscription</dt>
                      <dd>{formatDate(active.registered)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="ae-cli-modal-block">
                  <h3>Activité commerciale</h3>
                  <dl className="ae-cli-kv">
                    <div>
                      <dt>Commandes</dt>
                      <dd>{active.ordersCount}</dd>
                    </div>
                    <div>
                      <dt>CA cumulé</dt>
                      <dd>{formatEuro(active.totalSpent)}</dd>
                    </div>
                    <div>
                      <dt>Dernière commande</dt>
                      <dd>{active.lastOrderRef || '—'}</dd>
                    </div>
                  </dl>
                </section>

                <section className="ae-cli-modal-block">
                  <h3>Commandes récentes</h3>
                  {(active.recentOrders || []).length === 0 && (
                    <p className="ae-cli-empty" style={{ padding: '0.5rem 0' }}>
                      Aucune commande récente.
                    </p>
                  )}
                  {(active.recentOrders || []).map((o) => (
                    <div className="ae-cli-order-row" key={o.ref}>
                      <div>
                        <strong>{o.ref}</strong>
                        <span>
                          {formatDate(o.date)} · {o.status}
                        </span>
                      </div>
                      <strong>{formatEuro(o.total)}</strong>
                    </div>
                  ))}
                </section>

                {active.notes && (
                  <section className="ae-cli-modal-block">
                    <h3>Notes atelier</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#5c5f66', lineHeight: 1.45 }}>
                      {active.notes}
                    </p>
                  </section>
                )}
              </div>

              <div className="ae-cli-modal-footer">
                <button
                  type="button"
                  className="ae-cli-btn primary"
                  onClick={() => navigate(`/admin/orders?q=${encodeURIComponent(active.email)}`)}
                >
                  Voir les commandes
                </button>
                <Link to="/admin/orders/new" className="ae-cli-btn">
                  Créer une commande manuelle
                </Link>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
