import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdAdd, MdArrowBack, MdDeleteOutline, MdSave } from 'react-icons/md';
import { createManualOrder } from '../../services/ordersApi';
import { getProducts } from '../../services/productsApi';
import { DEMO_PRODUCTS } from '../../data/catalogDemo';
import '../../styles/catalog.css';
import '../../styles/orders.css';

const STATUSES = [
  'Validée',
  'En préparation',
  'Expédiée',
  'Livrée',
  'Retour / Litige',
  'Annulée',
];

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminOrderNew() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [useDemoProducts, setUseDemoProducts] = useState(false);
  const [client, setClient] = useState('');
  const [status, setStatus] = useState('En préparation');
  const [date, setDate] = useState(todayLocal());
  const [lines, setLines] = useState([{ productId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const res = await getProducts();
        const list = res.data || [];
        if (!cancelled) {
          if (list.length) {
            setProducts(list);
            setUseDemoProducts(false);
          } else {
            setProducts(DEMO_PRODUCTS);
            setUseDemoProducts(true);
          }
        }
      } catch {
        if (!cancelled) {
          setProducts(DEMO_PRODUCTS);
          setUseDemoProducts(true);
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productMap = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(String(p.id), p));
    return m;
  }, [products]);

  const availableForLine = (lineIndex) => {
    const taken = new Set(
      lines
        .map((l, i) => (i !== lineIndex && l.productId ? String(l.productId) : null))
        .filter(Boolean)
    );
    return products.filter((p) => !taken.has(String(p.id)) || String(lines[lineIndex].productId) === String(p.id));
  };

  const setLine = (index, patch) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const addLine = () => {
    setLines((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeLine = (index) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const enrichedLines = useMemo(
    () =>
      lines.map((l) => {
        const p = productMap.get(String(l.productId));
        const qty = Math.max(1, Number(l.quantity) || 1);
        const price = Number(p?.price) || 0;
        return {
          ...l,
          product: p || null,
          quantity: qty,
          lineTotal: p ? price * qty : 0,
          stock: p?.stock ?? null,
        };
      }),
    [lines, productMap]
  );

  const total = enrichedLines.reduce((s, l) => s + l.lineTotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!client.trim()) {
      setError('Le client (email ou identifiant) est obligatoire — champ API : client.');
      return;
    }
    if (!enrichedLines.some((l) => l.product)) {
      setError('Ajoutez au moins un produit.');
      return;
    }
    for (const l of enrichedLines) {
      if (!l.productId) continue;
      if (!l.product) {
        setError('Produit invalide sur une ligne.');
        return;
      }
      if (l.stock !== null && l.quantity > l.stock) {
        setError(`Stock insuffisant pour « ${l.product.name} » (dispo : ${l.stock}).`);
        return;
      }
    }

    if (useDemoProducts) {
      setError(
        'Catalogue en mode démo : créez d’abord de vrais produits (Catalogue → Nouveau produit), puis réessayez.'
      );
      return;
    }

    const items = enrichedLines
      .filter((l) => l.productId)
      .map((l) => ({
        productId: Number(l.productId) || l.productId,
        quantity: l.quantity,
      }));

    setLoading(true);
    try {
      const created = await createManualOrder({
        client: client.trim(),
        status,
        date: new Date(date).toISOString(),
        items,
      });
      const id = created.data?.id;
      setSuccess(
        `Commande créée${id ? ` #EP-${String(id).padStart(4, '0')}` : ''} — total ${formatEuro(
          created.data?.total ?? total
        )}.`
      );
      setTimeout(() => navigate('/admin/orders'), 900);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Création impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ae-ord ae-ord-form-page">
      <div className="ae-ord-crumb">
        Administration boutique <span className="accent">/ Flux &amp; logistique</span>
      </div>

      <div className="ae-ord-head">
        <div>
          <Link to="/admin/orders" className="ae-ord-back">
            <MdArrowBack size={16} /> Retour commandes
          </Link>
          <h1>Nouvelle commande manuelle</h1>
          <p className="ae-ord-sub">
            Champs alignés sur le modèle : <code>client</code>, <code>status</code>, <code>date</code>,{' '}
            <code>total</code> + lignes <code>ProductId</code> / <code>quantity</code> / <code>price</code>.
          </p>
        </div>
      </div>

      {useDemoProducts && (
        <div className="ae-ord-demo">
          Catalogue démo affiché pour le formulaire — la création API nécessite des produits réels en base.
        </div>
      )}
      {error && <div className="ae-ord-error">{error}</div>}
      {success && <div className="ae-ord-toast">{success}</div>}

      <form className="ae-ord-form" onSubmit={handleSubmit}>
        <section className="ae-prod-card">
          <h2>Commande</h2>
          <div className="ae-prod-grid">
            <label className="ae-prod-field ae-prod-field--full">
              <span>Client * (email ou nom — champ API client)</span>
              <input
                className="ae-prod-input"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="ex. client@maison.fr ou Maison Sarah L."
                required
              />
            </label>

            <label className="ae-prod-field">
              <span>Statut *</span>
              <select
                className="ae-prod-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="ae-prod-field">
              <span>Date *</span>
              <input
                className="ae-prod-input"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="ae-prod-card">
          <div className="ae-ord-form-section-head">
            <h2>Articles (OrderItem)</h2>
            <button type="button" className="ae-ord-btn" onClick={addLine} disabled={loadingProducts}>
              <MdAdd size={16} /> Ajouter une ligne
            </button>
          </div>

          {loadingProducts ? (
            <p className="ae-ord-empty">Chargement du catalogue…</p>
          ) : (
            <div className="ae-ord-lines">
              {enrichedLines.map((line, index) => (
                <div className="ae-ord-line" key={index}>
                  <label className="ae-prod-field ae-ord-line-product">
                    <span>Produit *</span>
                    <select
                      className="ae-prod-input"
                      value={line.productId}
                      onChange={(e) => setLine(index, { productId: e.target.value })}
                      required={index === 0}
                    >
                      <option value="">Sélectionner…</option>
                      {availableForLine(index).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatEuro(p.price)} (stock {p.stock ?? 0})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="ae-prod-field ae-ord-line-qty">
                    <span>Quantité *</span>
                    <input
                      className="ae-prod-input"
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => setLine(index, { quantity: e.target.value })}
                      required
                    />
                  </label>

                  <div className="ae-ord-line-meta">
                    <span className="label">Prix u.</span>
                    <strong>{line.product ? formatEuro(line.product.price) : '—'}</strong>
                  </div>
                  <div className="ae-ord-line-meta">
                    <span className="label">Ligne</span>
                    <strong>{line.product ? formatEuro(line.lineTotal) : '—'}</strong>
                  </div>

                  <button
                    type="button"
                    className="ae-ord-line-remove"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 1}
                    aria-label="Supprimer la ligne"
                  >
                    <MdDeleteOutline size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ae-prod-card ae-prod-summary">
          <h2>Récapitulatif</h2>
          <ul>
            <li>
              <strong>client</strong> — {client.trim() || '—'}
            </li>
            <li>
              <strong>status</strong> — {status}
            </li>
            <li>
              <strong>date</strong> — {date ? new Date(date).toLocaleString('fr-FR') : '—'}
            </li>
            <li>
              <strong>items</strong> —{' '}
              {enrichedLines.filter((l) => l.product).length
                ? enrichedLines
                    .filter((l) => l.product)
                    .map((l) => `${l.product.name} ×${l.quantity}`)
                    .join(', ')
                : '—'}
            </li>
            <li>
              <strong>total</strong> — {formatEuro(total)}
            </li>
          </ul>
        </section>

        <div className="ae-prod-actions">
          <Link to="/admin/orders" className="ae-cat-btn">
            Annuler
          </Link>
          <button type="submit" className="ae-cat-btn primary" disabled={loading || loadingProducts}>
            <MdSave size={16} />
            {loading ? 'Création…' : 'Enregistrer la commande'}
          </button>
        </div>
      </form>
    </div>
  );
}
