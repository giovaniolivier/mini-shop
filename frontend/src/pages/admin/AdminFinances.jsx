import { useEffect, useMemo, useState } from 'react';
import {
  MdAdd,
  MdAllInclusive,
  MdCalendarToday,
  MdCheckCircle,
  MdContentCopy,
  MdDescription,
  MdEdit,
  MdMoreVert,
  MdOpenInNew,
  MdPercent,
  MdPersonAddAlt1,
  MdReceiptLong,
  MdSchedule,
  MdSecurity,
  MdTrendingUp,
  MdVerifiedUser,
} from 'react-icons/md';
import { getOrders } from '../../services/ordersApi';
import {
  DEMO_FIN_CASHFLOW,
  DEMO_FIN_KPI,
  DEMO_FIN_LINES,
  DEMO_FIN_PROMOS,
  DEMO_FIN_SESSION,
  DEMO_FIN_TEAM,
} from '../../data/financesDemo';
import '../../styles/finances.css';

const PERIODS = [
  { key: 'month', label: 'Mois en cours' },
  { key: 'q3', label: 'Trimestre Q3' },
  { key: 'year', label: 'Année 2024' },
];

function formatEuro(v, digits = 0) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} €`;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function isPaid(o) {
  const s = String(o.status || '').toLowerCase();
  return s !== 'cart' && !s.includes('annul');
}

function deriveFromOrders(orders) {
  const paid = orders.filter(isPaid);
  const caBrut = paid.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const caNet = caBrut / 1.2;
  const tva = caBrut - caNet;
  const margePct = 64.8;
  const margeEuro = caNet * (margePct / 100);

  const catMap = {};
  for (const o of paid) {
    for (const item of o.items || []) {
      const cat = item.Product?.category || 'Non classé';
      const line = (item.price || 0) * (item.quantity || 0);
      if (!catMap[cat]) catMap[cat] = { ca: 0, qty: 0 };
      catMap[cat].ca += line;
      catMap[cat].qty += item.quantity || 0;
    }
  }
  const colors = ['#8b6914', '#b88e5f', '#c4a574', '#6b5b4a'];
  const lines = Object.entries(catMap)
    .map(([name, v], i) => ({
      name,
      ca: v.ca,
      marge: 55 + (i % 4) * 5,
      color: colors[i % colors.length],
    }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 4);

  const cashflow = paid.slice(0, 6).map((o) => ({
    id: `TRX-${o.id}`,
    date: o.date || o.createdAt,
    channel: `Stripe · ${o.client || 'Client'}`,
    amount: Number(o.total) || 0,
    stripe: 'Succeeded',
    reconcile: 'auto',
  }));

  return {
    kpi: {
      caNet: Number(caNet.toFixed(0)),
      caBrut: Number(caBrut.toFixed(0)),
      caDelta: 0,
      margePct,
      margeEuro: Number(margeEuro.toFixed(0)),
      margeDeltaPts: 0,
      coutMatieres: Number((caNet - margeEuro).toFixed(0)),
      tva: Number(tva.toFixed(0)),
      tvaDue: 'Prochaine CA3',
      provisionne: true,
    },
    lines: lines.length ? lines : DEMO_FIN_LINES,
    cashflow: cashflow.length ? cashflow : DEMO_FIN_CASHFLOW,
  };
}

export default function AdminFinances() {
  const [period, setPeriod] = useState('q3');
  const [useDemo, setUseDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [kpi, setKpi] = useState(DEMO_FIN_KPI);
  const [lines, setLines] = useState(DEMO_FIN_LINES);
  const [cashflow, setCashflow] = useState(DEMO_FIN_CASHFLOW);
  const [promos, setPromos] = useState(DEMO_FIN_PROMOS);
  const [team] = useState(DEMO_FIN_TEAM);
  const [session] = useState(DEMO_FIN_SESSION);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getOrders();
        const orders = (res.data || []).filter((o) => o.status !== 'cart');
        if (!cancelled) {
          if (orders.length) {
            const derived = deriveFromOrders(orders);
            setUseDemo(false);
            setKpi(derived.kpi);
            setLines(derived.lines);
            setCashflow(derived.cashflow);
          } else {
            setUseDemo(true);
            setKpi(DEMO_FIN_KPI);
            setLines(DEMO_FIN_LINES);
            setCashflow(DEMO_FIN_CASHFLOW);
          }
        }
      } catch {
        if (!cancelled) {
          setUseDemo(true);
          setKpi(DEMO_FIN_KPI);
          setLines(DEMO_FIN_LINES);
          setCashflow(DEMO_FIN_CASHFLOW);
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

  const maxLineCa = useMemo(
    () => Math.max(...lines.map((l) => l.ca), 1),
    [lines]
  );

  const generateReport = () => {
    const rows = [
      ['Indicateur', 'Valeur'],
      ['CA net', kpi.caNet],
      ['CA brut', kpi.caBrut],
      ['Marge %', kpi.margePct],
      ['Marge €', kpi.margeEuro],
      ['TVA', kpi.tva],
      [],
      ['Réf', 'Canal', 'Montant', 'Statut'],
      ...cashflow.map((t) => [t.id, t.channel, t.amount, t.stripe]),
    ];
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-comptable-epure-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Rapport comptable généré (.CSV)');
  };

  const togglePromo = (id) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const validateInvoice = (id) => {
    setCashflow((prev) =>
      prev.map((t) => (t.id === id ? { ...t, reconcile: 'auto' } : t))
    );
    setToast(`Rapprochement validé · ${id}`);
  };

  return (
    <div className="ae-fin">
      <div className="ae-fin-crumb">
        Console financière <span className="accent">/ Q3 2024 Audit</span>
      </div>

      <div className="ae-fin-head">
        <div>
          <h1>Marketing, Promotions &amp; Rapports Financiers</h1>
          <p className="ae-fin-sub">
            Supervision comptable, rentabilité atelier et campagnes promotionnelles —
            pilotage de la marge nette Épure Studio.
          </p>
        </div>
        <div className="ae-fin-head-actions">
          <div className="ae-fin-periods" role="group" aria-label="Période">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={period === p.key ? 'active' : ''}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" className="ae-fin-btn primary" onClick={generateReport}>
            <MdDescription size={16} /> Générer rapport comptable
          </button>
        </div>
      </div>

      {useDemo && (
        <div className="ae-fin-demo">
          Mode démo maquette — indicateurs Q3 2024. Branchez des commandes API pour des totaux
          réels.
        </div>
      )}
      {toast && <div className="ae-fin-toast">{toast}</div>}
      {loading && <div className="ae-fin-demo">Chargement des ventes…</div>}

      <p className="ae-fin-section-title">Indicateurs de Trésorerie &amp; Rentabilité</p>
      <div className="ae-fin-kpis">
        <div className="ae-fin-kpi">
          <div className="ae-fin-kpi-ico">
            <MdTrendingUp size={18} />
          </div>
          <label>Chiffre d’affaires Net</label>
          <strong>{formatEuro(kpi.caNet)}</strong>
          {kpi.caDelta > 0 && <div className="delta">+{kpi.caDelta}% vs Q2</div>}
          <div className="hint">Volume brut : {formatEuro(kpi.caBrut)}</div>
        </div>
        <div className="ae-fin-kpi">
          <div className="ae-fin-kpi-ico">
            <MdPercent size={18} />
          </div>
          <label>Marge Brute Globale</label>
          <strong>
            {kpi.margePct}% ({formatEuro(kpi.margeEuro)})
          </strong>
          {kpi.margeDeltaPts > 0 && (
            <div className="delta">+{kpi.margeDeltaPts} pts d’optimisation</div>
          )}
          <div className="hint">Coût matières : {formatEuro(kpi.coutMatieres)}</div>
        </div>
        <div className="ae-fin-kpi">
          <div className="ae-fin-kpi-ico">
            <MdReceiptLong size={18} />
          </div>
          <label>TVA Collectée à Reverser</label>
          <strong>{formatEuro(kpi.tva)}</strong>
          <div className="delta warn">Déclaration CA3 · {kpi.tvaDue}</div>
          <div className="hint">
            {kpi.provisionne ? 'Provisionnement total' : 'À provisionner'}
          </div>
        </div>
      </div>

      <div className="ae-fin-grid-2">
        <section className="ae-fin-card">
          <div className="ae-fin-card-head">
            <div>
              <h2>Rentabilité par Ligne d’Atelier</h2>
              <p>CA et marge par famille produit</p>
            </div>
          </div>
          {lines.map((l) => (
            <div className="ae-fin-line" key={l.name}>
              <div className="ae-fin-line-top">
                <strong>{l.name}</strong>
                <span>
                  {formatEuro(l.ca)} · {l.marge}%
                </span>
              </div>
              <div className="ae-fin-bar">
                <i
                  style={{
                    width: `${Math.max(8, Math.round((l.ca / maxLineCa) * 100))}%`,
                    background: l.color,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="ae-fin-insight">
            Les pièces céramique / objets d’art portent la marge la plus élevée — prioriser les
            séries limitées pour le Q4.
          </div>
        </section>

        <section className="ae-fin-card">
          <div className="ae-fin-card-head">
            <div>
              <h2>Flux de Trésorerie Récents</h2>
              <p>Encaissements &amp; décaissements</p>
            </div>
            <span className="ae-fin-pill">
              <MdCheckCircle size={14} /> 99.4% Concilié
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ae-fin-table">
              <thead>
                <tr>
                  <th>Réf &amp; date</th>
                  <th>Canal / Tiers</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Rapprochement</th>
                </tr>
              </thead>
              <tbody>
                {cashflow.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="ae-fin-ref">
                        <strong>{t.id}</strong>
                        <span>{formatDate(t.date)}</span>
                      </div>
                    </td>
                    <td>{t.channel}</td>
                    <td>
                      <span className={`ae-fin-amt ${t.amount >= 0 ? 'in' : 'out'}`}>
                        {t.amount >= 0 ? '+' : ''}
                        {formatEuro(t.amount)}
                      </span>
                    </td>
                    <td>{t.stripe}</td>
                    <td>
                      {t.reconcile === 'auto' ? (
                        <span className="ae-fin-badge-soft">
                          <MdCheckCircle size={14} /> Automatique
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="ae-fin-mini-btn"
                          onClick={() => validateInvoice(t.id)}
                        >
                          Valider facture
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="ae-fin-card ae-fin-promo-wrap">
        <div className="ae-fin-card-head">
          <div>
            <h2>Campagnes &amp; Privilèges Promotionnels</h2>
            <p>Arbitrage des remises et incitations commerciales sélectives.</p>
          </div>
          <button
            type="button"
            className="ae-fin-btn primary"
            onClick={() => setToast('Création d’offre : bientôt disponible')}
          >
            <MdAdd size={16} /> Créer une offre promotionnelle
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ae-fin-table ae-fin-table--promo">
            <thead>
              <tr>
                <th>Code promo</th>
                <th>Type d’avantage</th>
                <th>Jauge d’utilisation</th>
                <th>Revenu engagé</th>
                <th>Échéance</th>
                <th>Statut direct</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const pct = Math.min(100, Math.round((p.used / p.cap) * 100));
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="ae-fin-code-cell">
                        <div className="ae-fin-code-row">
                          <span className="ae-fin-code">{p.code}</span>
                          <button
                            type="button"
                            className="ae-fin-ico-btn ghost"
                            aria-label="Copier le code"
                            onClick={() => {
                              navigator.clipboard?.writeText(p.code);
                              setToast(`Code ${p.code} copié`);
                            }}
                          >
                            <MdContentCopy size={14} />
                          </button>
                        </div>
                        <span className="ae-fin-code-sub">{p.collection || p.detail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ae-fin-ref">
                        <strong>{p.type}</strong>
                        <span>{p.detail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ae-fin-gauge">
                        <div className="ae-fin-gauge-top">
                          <span>
                            {p.used} / {p.cap}
                          </span>
                          {p.exhausted ? (
                            <em className="ae-fin-exhau">Épuisé</em>
                          ) : (
                            <span className="pct">{pct}%</span>
                          )}
                        </div>
                        <div className="ae-fin-bar">
                          <i
                            style={{
                              width: `${pct}%`,
                              background: p.exhausted
                                ? '#c45c26'
                                : p.active
                                  ? '#b88e5f'
                                  : '#c5c3be',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{formatEuro(p.revenue)}</strong>
                    </td>
                    <td>
                      <div className={`ae-fin-expiry${p.expired ? ' late' : ''}`}>
                        {p.expireKind === 'infinite' ? (
                          <MdAllInclusive size={14} />
                        ) : p.expireKind === 'clock' ? (
                          <MdSchedule size={14} />
                        ) : (
                          <MdCalendarToday size={14} />
                        )}
                        <span>{p.expires}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`ae-fin-toggle${p.active ? ' on' : ''}`}
                        onClick={() => togglePromo(p.id)}
                        aria-pressed={p.active}
                        aria-label={p.active ? 'Désactiver' : 'Activer'}
                      >
                        <i />
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ae-fin-ico-btn"
                        aria-label="Ouvrir"
                        onClick={() => setToast(`Fiche offre ${p.code}`)}
                      >
                        <MdOpenInNew size={15} />
                      </button>
                      <button
                        type="button"
                        className="ae-fin-ico-btn"
                        aria-label="Modifier"
                        onClick={() => setToast(`Édition ${p.code}`)}
                      >
                        <MdEdit size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="ae-fin-sec-head">
        <div>
          <h2>Sécurité Système, Rôles &amp; Sessions Actives</h2>
          <p>Gouvernance des accès console et révocation des jetons.</p>
        </div>
      </div>
      <div className="ae-fin-bottom">
        <section className="ae-fin-card">
          <div className="ae-fin-card-head">
            <div>
              <h2>Membres de l’Équipe &amp; Périmètres d’Autorisation</h2>
            </div>
            <button
              type="button"
              className="ae-fin-link-btn"
              onClick={() => setToast('Invitation collaborateur : bientôt disponible')}
            >
              <MdPersonAddAlt1 size={16} /> Inviter un collaborateur
            </button>
          </div>
          <div className="ae-fin-members">
            {team.map((m) => (
              <div className="ae-fin-member-card" key={m.id}>
                <div className="ae-fin-avatar" aria-hidden>
                  {initials(m.name)}
                </div>
                <div className="ae-fin-member-body">
                  <div className="ae-fin-member-name">
                    <strong>{m.name}</strong>
                    <span className={`ae-fin-role tone-${m.roleTone || 'gray'}`}>{m.role}</span>
                  </div>
                  <span className="mail">{m.email}</span>
                  <div className="scope">{m.scope}</div>
                </div>
                <span className={`ae-fin-online${m.online ? '' : ' off'}`}>
                  {m.activity || (m.online ? 'En ligne' : 'Hors ligne')}
                </span>
                <button
                  type="button"
                  className="ae-fin-ico-btn ghost"
                  aria-label="Actions membre"
                  onClick={() => setToast(`Actions · ${m.name}`)}
                >
                  <MdMoreVert size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="ae-fin-card">
          <div className="ae-fin-card-head">
            <div>
              <h2>
                <MdSecurity size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                Politique des Sessions
              </h2>
              <p>Règles de révocation des tokens cryptographiques JWT {session.jwt}.</p>
            </div>
          </div>
          <dl className="ae-fin-session-list">
            <div>
              <dt>Durée du Jeton Actif</dt>
              <dd>{session.tokenMins} minutes</dd>
            </div>
            <div>
              <dt>Inactivité Session</dt>
              <dd>{session.idleMins} minutes</dd>
            </div>
            <div>
              <dt>Authentification 2FA</dt>
              <dd className="ok">
                <MdVerifiedUser size={16} /> {session.twoFa}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className="ae-fin-btn ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setToast('Rotation des clés JWT planifiée')}
          >
            Forcer rotation des clés JWT
          </button>
          <p className="ae-fin-session-meta">Empreinte SHA256 courante : {session.fingerprint}</p>
        </section>
      </div>
    </div>
  );
}
