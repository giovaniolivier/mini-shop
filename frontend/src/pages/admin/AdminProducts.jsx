import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdAdd,
  MdContentCopy,
  MdDescription,
  MdDownload,
  MdEdit,
  MdGridView,
  MdLocalShipping,
  MdRefresh,
  MdSearch,
  MdSync,
  MdViewColumn,
  MdViewList,
  MdVisibility,
  MdWarningAmber,
  MdVerifiedUser,
  MdReceiptLong,
} from 'react-icons/md';
import { getProducts, createProduct, updateProduct } from '../../services/productsApi';
import { getOrders } from '../../services/ordersApi';
import ProductForm from '../../components/ProductForm';
import { DEMO_KPI, DEMO_ORDERS, DEMO_PRODUCTS } from '../../data/catalogDemo';
import '../../styles/catalog.css';

const CATEGORIES_BASE = [
  "Assises d'Atelier",
  'Luminaires',
  'Mobilier',
  'Objets & Décoration',
  'Électronique',
  'Maison',
  'Autre',
];
const PAGE_SIZE_DEFAULT = 25;
const ORDER_STATUSES = ['En cours', 'Traitée (Entrepôt)', 'Expédiée', 'Livrée Client'];

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`;
}

function enrichProduct(p) {
  const idNum = Number(p.id) || 0;
  const sku =
    p.sku ||
    `EP-${String(p.category || 'XX')
      .slice(0, 2)
      .toUpperCase()}-${String(idNum).padStart(3, '0')}`;
  const threshold = p.threshold ?? (idNum % 2 === 0 ? 5 : 3);
  const stock = Number(p.stock ?? 0);
  let statusKey = 'actif';
  let statusLabel = 'Actif';
  if (stock <= 0) {
    statusKey = 'epuise';
    statusLabel = 'Épuisé';
  } else if (stock <= threshold) {
    statusKey = 'faible';
    statusLabel = 'Stock Faible';
  }
  const draft = !p.image_url || !String(p.description || '').trim();
  if (draft && statusKey === 'actif') {
    statusKey = 'brouillon';
    statusLabel = 'Brouillon';
  }
  return {
    ...p,
    sku,
    material: p.material || p.description?.split(',')[0] || '—',
    finish: p.finish || null,
    margin: p.margin ?? 45 + (idNum % 30),
    threshold,
    statusKey,
    statusLabel,
    salesQty: p.salesQty ?? 0,
    salesRevenue: p.salesRevenue ?? 0,
  };
}

function stockBarClass(p) {
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.threshold) return 'low';
  return 'ok';
}

function stockBarWidth(p) {
  if (p.stock <= 0) return 8;
  const max = Math.max(p.threshold * 4, 20);
  return Math.min(100, Math.round((p.stock / max) * 100));
}

function statusSelectClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('livr')) return 'st-livree';
  if (s.includes('expéd') || s.includes('exped')) return 'st-expediee';
  if (s.includes('trait')) return 'st-traitee';
  return 'st-encours';
}

function relativeTime(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '—';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  return `Il y a ${Math.floor(hours / 24)} j`;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiProducts, setApiProducts] = useState([]);
  const [apiOrders, setApiOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useDemo, setUseDemo] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    image_url: '',
    category: '',
    stock: 10,
    description: '',
  });
  const [editId, setEditId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryList, setCategoryList] = useState(CATEGORIES_BASE);
  const [dragActive, setDragActive] = useState(false);
  const [tab, setTab] = useState('all');
  const [filterQ, setFilterQ] = useState(() => searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState('');
  const [orderStatusLocal, setOrderStatusLocal] = useState({});

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, ordRes] = await Promise.all([getProducts(), getOrders()]);
      const list = (prodRes.data || []).map((p) => ({ ...p, stock: p.stock ?? 0 }));
      setApiProducts(list);
      setApiOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
      setUseDemo(list.length === 0);
      const cats = Array.from(
        new Set([...CATEGORIES_BASE, ...list.map((p) => p.category).filter(Boolean)])
      );
      setCategoryList(cats);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const salesMap = useMemo(() => {
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const map = {};
    for (const order of apiOrders) {
      if (String(order.status).toLowerCase() === 'cart') continue;
      const d = new Date(order.date || order.createdAt).getTime();
      if (Number.isNaN(d) || d < since) continue;
      for (const item of order.items || []) {
        const pid = item.ProductId || item.Product?.id;
        if (!pid) continue;
        if (!map[pid]) map[pid] = { qty: 0, revenue: 0 };
        map[pid].qty += item.quantity || 0;
        map[pid].revenue += (item.price || 0) * (item.quantity || 0);
      }
    }
    return map;
  }, [apiOrders]);

  const products = useMemo(() => {
    if (useDemo) return DEMO_PRODUCTS.map(enrichProduct);
    return apiProducts.map((p) =>
      enrichProduct({
        ...p,
        salesQty: salesMap[p.id]?.qty || 0,
        salesRevenue: salesMap[p.id]?.revenue || 0,
      })
    );
  }, [useDemo, apiProducts, salesMap]);

  const kpi = useMemo(() => {
    if (useDemo) return DEMO_KPI;
    const all = products.length;
    const out = products.filter((p) => p.stock <= 0).length;
    const critical = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
    const inStock = products.filter((p) => p.stock > p.threshold).length;
    const drafts = products.filter((p) => p.statusKey === 'brouillon').length;
    const marketValue = products.reduce((s, p) => s + Number(p.price || 0) * Math.max(p.stock, 0), 0);
    const healthyUnits = products.filter((p) => p.stock > p.threshold).reduce((s, p) => s + p.stock, 0);
    const availability = all ? ((all - out) / all) * 100 : 0;
    const pending = apiOrders.filter((o) => {
      const s = String(o.status || '').toLowerCase();
      return s !== 'cart' && !s.includes('livr');
    });
    return {
      all,
      inStock,
      critical: critical + out,
      drafts,
      marketValue,
      availability,
      healthyUnits,
      growth: 0,
      pendingCount: pending.length,
      pendingVolume: pending.reduce((s, o) => s + (o.total || 0), 0),
      supplierDays: 14,
    };
  }, [useDemo, products, apiOrders]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (tab === 'stock') list = list.filter((p) => p.stock > p.threshold);
    if (tab === 'critical') list = list.filter((p) => p.stock <= p.threshold);
    if (tab === 'draft') list = list.filter((p) => p.statusKey === 'brouillon');
    if (filterQ.trim()) {
      const q = filterQ.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.sku).toLowerCase().includes(q) ||
          String(p.material).toLowerCase().includes(q) ||
          String(p.category || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter) list = list.filter((p) => p.statusKey === statusFilter);
    return list;
  }, [products, tab, filterQ, categoryFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [tab, filterQ, categoryFilter, statusFilter, pageSize]);

  const recentOrders = useMemo(() => {
    if (useDemo) return DEMO_ORDERS;
    return [...apiOrders]
      .filter((o) => String(o.status).toLowerCase() !== 'cart')
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 4)
      .map((o) => ({
        id: String(o.id).padStart(4, '0'),
        client: o.client || 'Client',
        itemsLabel: (o.items || [])
          .slice(0, 2)
          .map((it) => `${it.quantity}× ${it.Product?.name || 'Article'}`)
          .join(', ') || 'Articles commandés',
        total: o.total || 0,
        ago: relativeTime(o.date || o.createdAt),
        status: orderStatusLocal[o.id] || (String(o.status).includes('Valid') ? 'En cours' : o.status),
        rawId: o.id,
      }));
  }, [useDemo, apiOrders, orderStatusLocal]);

  const openCreate = () => {
    navigate('/admin/products/new');
  };

  const openEdit = (prod) => {
    if (prod._demo) {
      setToast('Produit démo maquette — non modifiable en base');
      return;
    }
    setForm({
      name: prod.name || '',
      price: prod.price || '',
      image_url: prod.image_url || '',
      category: prod.category || '',
      stock: prod.stock ?? 10,
      description: prod.description || '',
    });
    setEditId(prod.id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setToast('Nom et prix obligatoires');
      return;
    }
    try {
      const payload = {
        name: form.name,
        price: form.price,
        image_url: form.image_url,
        stock: Number(form.stock),
        description: form.description,
        category: form.category,
      };
      if (editId) {
        const res = await updateProduct(editId, payload);
        setApiProducts((prev) => prev.map((p) => (p.id === editId ? res.data : p)));
        setUseDemo(false);
        setToast('Produit mis à jour');
      } else {
        const res = await createProduct(payload);
        setApiProducts((prev) => [...prev, res.data]);
        setUseDemo(false);
        setToast('Produit créé');
      }
      closeForm();
    } catch (err) {
      setToast(err.response?.data?.message || err.message || 'Erreur sauvegarde');
    }
  };

  const handleDuplicate = async (prod) => {
    if (prod._demo) {
      setToast('Duplication indisponible en mode démo');
      return;
    }
    try {
      const res = await createProduct({
        name: `${prod.name} (copie)`,
        price: prod.price,
        image_url: prod.image_url,
        stock: prod.stock ?? 0,
        description: prod.description,
        category: prod.category,
      });
      setApiProducts((prev) => [...prev, res.data]);
      setToast('Produit dupliqué');
    } catch (err) {
      setToast(err.response?.data?.message || 'Duplication impossible');
    }
  };

  const addCategory = (cat) => {
    if (!cat || categoryList.includes(cat)) return;
    setCategoryList((prev) => [...prev, cat]);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => setForm((f) => ({ ...f, image_url: evt.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => setForm((f) => ({ ...f, image_url: evt.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const exportCsv = () => {
    const rows = [
      ['SKU', 'Nom', 'Catégorie', 'Finition', 'Prix', 'Marge', 'Stock', 'Statut', 'Ventes30j', 'CA30j'],
      ...filtered.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.finish || '',
        p.price,
        p.margin,
        p.stock,
        p.statusLabel,
        p.salesQty,
        p.salesRevenue,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogue-epure-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabCounts = useDemo
    ? { all: kpi.all, stock: kpi.inStock, critical: kpi.critical, draft: kpi.drafts }
    : {
        all: products.length,
        stock: products.filter((p) => p.stock > p.threshold).length,
        critical: products.filter((p) => p.stock <= p.threshold).length,
        draft: products.filter((p) => p.statusKey === 'brouillon').length,
      };

  const displayTotal = useDemo ? kpi.all : filtered.length;
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, filtered.length);

  return (
    <div className="ae-cat">
      <div className="ae-cat-crumb">
        Administration boutique <span className="accent">/ Inventaire &amp; flux</span>
      </div>

      <div className="ae-cat-head">
        <h1>Catalogue &amp; Stocks</h1>
        <div className="ae-cat-actions">
          <button type="button" className="ae-cat-btn" onClick={exportCsv}>
            <MdDownload size={16} /> Exporter (.CSV)
          </button>
          <button type="button" className="ae-cat-btn" onClick={() => setToast('Synchronisation ERP simulée')}>
            <MdSync size={16} /> Synchroniser ERP
          </button>
          <button type="button" className="ae-cat-btn primary" onClick={openCreate}>
            <MdAdd size={18} /> Nouveau Produit
          </button>
        </div>
      </div>

      {useDemo && (
        <div className="ae-cat-demo-banner">
          Mode maquette : catalogue vide en base — affichage des données démo Épure Studio (identiques à la
          maquette). Créez un produit pour basculer sur vos données réelles.
        </div>
      )}

      <div className="ae-cat-kpis">
        <article className="ae-cat-kpi">
          <div className="ae-cat-kpi-ico">
            <MdDescription size={18} />
          </div>
          <label>Références actives</label>
          <div className="ae-cat-kpi-value">
            <strong>{kpi.all}</strong>
            {kpi.growth > 0 && <span className="ae-pill growth">↑ +{kpi.growth}% ce mois</span>}
          </div>
          <div className="sub">Valeur marchande : {formatEuro(kpi.marketValue)}</div>
        </article>

        <article className="ae-cat-kpi">
          <div className="ae-cat-kpi-ico">
            <MdVerifiedUser size={18} />
          </div>
          <label>Taux de disponibilité</label>
          <div className="ae-cat-kpi-value">
            <strong>{Number(kpi.availability).toFixed(1)}%</strong>
            <span className="ae-pill ok">Optimal</span>
          </div>
          <div className="sub">{kpi.healthyUnits} pièces en stock sain</div>
        </article>

        <article className="ae-cat-kpi">
          <div className="ae-cat-kpi-ico warn">
            <MdWarningAmber size={18} />
          </div>
          <label>Alerte réappro</label>
          <div className="ae-cat-kpi-value">
            <strong className={kpi.critical ? 'warn' : ''}>{kpi.critical}</strong>
            <span className={`ae-pill ${kpi.critical ? 'warn' : 'ok'}`}>
              {kpi.critical ? 'Action requise' : 'OK'}
            </span>
          </div>
          <div className="sub">Délai moyen fournisseur : {kpi.supplierDays}j</div>
        </article>

        <article className="ae-cat-kpi">
          <div className="ae-cat-kpi-ico">
            <MdLocalShipping size={18} />
          </div>
          <label>Commandes en attente</label>
          <div className="ae-cat-kpi-value">
            <strong>{kpi.pendingCount}</strong>
            <span className="ae-pill ship">À expédier</span>
          </div>
          <div className="sub">Volume journalier : {formatEuro(kpi.pendingVolume)}</div>
        </article>
      </div>

      <section className="ae-cat-panel">
        <div className="ae-cat-toolbar">
          <div className="ae-cat-tabs">
            <button type="button" className={`ae-cat-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>
              Tous les produits {tabCounts.all}
            </button>
            <button
              type="button"
              className={`ae-cat-tab${tab === 'stock' ? ' active' : ''}`}
              onClick={() => setTab('stock')}
            >
              En stock {tabCounts.stock}
            </button>
            <button
              type="button"
              className={`ae-cat-tab${tab === 'critical' ? ' active' : ''}`}
              onClick={() => setTab('critical')}
            >
              Stock critique {tabCounts.critical}
            </button>
            <button
              type="button"
              className={`ae-cat-tab${tab === 'draft' ? ' active' : ''}`}
              onClick={() => setTab('draft')}
            >
              Brouillons {tabCounts.draft}
            </button>
          </div>
          <div className="ae-cat-view-wrap">
            Vue :
            <div className="ae-cat-view">
              <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                <MdViewList size={18} />
              </button>
              <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
                <MdGridView size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="ae-cat-filters">
          <div className="ae-cat-search">
            <MdSearch size={17} />
            <input
              type="search"
              placeholder="Filtrer par nom, SKU, matière..."
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
            />
          </div>
          <select className="ae-cat-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Toutes catégories</option>
            {categoryList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className="ae-cat-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Statut de visibilité</option>
            <option value="actif">Actif</option>
            <option value="faible">Stock Faible</option>
            <option value="epuise">Épuisé</option>
            <option value="brouillon">Brouillon</option>
          </select>
          <div className="ae-cat-view" style={{ marginLeft: 'auto' }}>
            <button type="button" aria-label="Colonnes">
              <MdViewColumn size={18} />
            </button>
            <button type="button" onClick={loadAll} aria-label="Actualiser">
              <MdRefresh size={18} />
            </button>
          </div>
        </div>

        {error && !useDemo && <div className="ae-dash-error">{error}</div>}

        {loading ? (
          <div className="ae-cat-empty">Chargement du catalogue…</div>
        ) : view === 'grid' ? (
          <div className="ae-cat-grid">
            {pageItems.map((p) => (
              <article key={p.id} className="ae-cat-card">
                {p.image_url ? <img src={p.image_url} alt="" /> : <div className="ph" />}
                <div className="body">
                  <strong style={{ display: 'block', marginBottom: 4 }}>{p.name}</strong>
                  <div style={{ fontSize: 12, color: '#9a9da3', marginBottom: 8 }}>{p.sku}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{formatEuro(p.price)}</strong>
                    <span className={`ae-cat-status ${p.statusKey}`}>{p.statusLabel}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="ae-cat-table-wrap">
            <table className="ae-cat-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={pageItems.length > 0 && selected.length === pageItems.length}
                      onChange={() =>
                        setSelected(selected.length === pageItems.length ? [] : pageItems.map((p) => p.id))
                      }
                    />
                  </th>
                  <th>Produit &amp; référence</th>
                  <th>Catégorie / finition</th>
                  <th>Prix HT &amp; marge</th>
                  <th>Niveau de stock</th>
                  <th>Statut</th>
                  <th>Ventes (30j)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className="ae-cat-prod">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="ae-cat-thumb" />
                        ) : (
                          <div className="ae-cat-thumb" />
                        )}
                        <div>
                          <strong>{p.name}</strong>
                          <span className="sku">
                            SKU: {p.sku} — {p.material}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ae-cat-tags">
                        <span className="ae-cat-tag">{p.category || '—'}</span>
                        {p.finish && <span className="ae-cat-tag muted">{p.finish}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="ae-cat-price">
                        <strong>{formatEuro(p.price)}</strong>
                        <span className="marge">Marge: {p.margin}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="ae-stock-cell">
                        <div className={`qty${p.stock <= 0 ? ' out' : ''}`}>
                          {p.stock <= 0
                            ? '0 en stock'
                            : p.stock <= p.threshold
                              ? `${p.stock} restant(s)`
                              : `${p.stock} en stock`}
                        </div>
                        <div className="ae-stock-bar">
                          <i className={stockBarClass(p)} style={{ width: `${stockBarWidth(p)}%` }} />
                        </div>
                        <div
                          className={`seuil${
                            p.stock <= 0 ? ' rupt' : p.stock <= p.threshold ? ' crit' : ''
                          }`}
                        >
                          {p.stock <= 0 ? 'Rupture' : p.stock <= p.threshold ? 'Critique' : `Seuil ${p.threshold}`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`ae-cat-status ${p.statusKey}`}>{p.statusLabel}</span>
                    </td>
                    <td>
                      <div className="ae-cat-sales">
                        <strong>{p.salesQty} pièces</strong>
                        <span>{formatEuro(p.salesRevenue)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ae-cat-row-actions">
                        <button type="button" className="ae-cat-icon" onClick={() => openEdit(p)} title="Modifier">
                          <MdEdit size={16} />
                        </button>
                        <button
                          type="button"
                          className="ae-cat-icon"
                          onClick={() => handleDuplicate(p)}
                          title="Dupliquer"
                        >
                          <MdContentCopy size={16} />
                        </button>
                        <button
                          type="button"
                          className="ae-cat-icon"
                          title="Voir"
                          onClick={() => {
                            if (p._demo) setToast('Aperçu boutique indisponible (démo)');
                            else window.open(`/product/${p.id}`, '_blank');
                          }}
                        >
                          <MdVisibility size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="ae-cat-empty">Aucun produit pour ce filtre.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="ae-cat-pager">
          <span>
            Affichage de {from} à {to} sur {useDemo && tab === 'all' && !filterQ ? displayTotal : filtered.length}{' '}
            produits
          </span>
          <div className="ae-cat-pager-mid">
            <select
              className="ae-cat-select"
              style={{ height: 32 }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={25}>25 par page</option>
              <option value={50}>50 par page</option>
              <option value={100}>100 par page</option>
            </select>
          </div>
          <div className="ae-cat-pager-nav">
            <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹
            </button>
            {(useDemo
              ? [1, 2, 3, '…', 6]
              : Array.from({ length: pageCount }, (_, i) => i + 1).slice(0, 6)
            ).map((n, i) =>
              n === '…' ? (
                <span key={`e${i}`} style={{ padding: '0 4px' }}>
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={n === currentPage ? 'active' : ''}
                  onClick={() => typeof n === 'number' && setPage(n)}
                >
                  {n}
                </button>
              )
            )}
            <button
              type="button"
              disabled={!useDemo && currentPage >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="ae-cat-orders-head">
          <h2>
            <MdReceiptLong size={18} /> Flux des Commandes Récentes
            <span className="hint">Changement de statut en 1-clic</span>
          </h2>
          <Link to="/admin/orders">Voir toutes les {kpi.pendingCount} commandes →</Link>
        </div>
        <div className="ae-cat-order-row">
          {recentOrders.map((o) => {
            const status = orderStatusLocal[o.rawId || o.id] || o.status;
            return (
              <article key={o.id} className="ae-cat-order">
                <div className="ae-cat-order-top">
                  <strong>CMD-2024-{o.id}</strong>
                  <span>{o.ago}</span>
                </div>
                <div className="client">{o.client}</div>
                <div className="items">{o.itemsLabel}</div>
                <div className="total">{formatEuro(o.total)}</div>
                <span className="statut-label">Statut</span>
                <select
                  className={statusSelectClass(status)}
                  value={status}
                  onChange={(e) => {
                    setOrderStatusLocal((prev) => ({ ...prev, [o.rawId || o.id]: e.target.value }));
                    setToast('Statut mis à jour');
                  }}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </article>
            );
          })}
        </div>
      </section>

      {formOpen && (
        <div className="ae-cat-modal" onClick={closeForm} role="presentation">
          <div className="ae-cat-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <ProductForm
              form={form}
              setForm={setForm}
              editId={editId}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              categoryList={categoryList}
              dragActive={dragActive}
              setDragActive={setDragActive}
              handleImageDrop={handleImageDrop}
              handleImageSelect={handleImageSelect}
              addCategory={addCategory}
            />
          </div>
        </div>
      )}

      {toast && <div className="ae-cat-toast">{toast}</div>}
    </div>
  );
}
