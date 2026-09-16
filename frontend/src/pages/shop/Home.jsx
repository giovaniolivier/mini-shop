import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';
import {
  MdExpandLess,
  MdExpandMore,
  MdGridView,
  MdSearch,
  MdTune,
  MdVerified,
  MdViewList,
} from 'react-icons/md';
import ProductCard from '../../components/ProductCard';
import { getProducts } from '../../services/productsApi';
import {
  DEMO_SHOP_PRODUCTS,
  SHOP_CATEGORY_TABS,
  SHOP_FILTER_CATEGORIES,
  SHOP_MATERIALS,
} from '../../data/shopDemo';
import '../../styles/shop.css';

const PAGE_STEP = 8;
const ALL_CATS = SHOP_FILTER_CATEGORIES.map((c) => c.id);

function enrichApiProduct(p, i) {
  const stock = Number(p.stock ?? 0);
  return {
    ...p,
    category: p.category || 'Création atelier',
    categoryKey: 'all',
    material: p.material || null,
    badge: stock <= 0 ? null : i % 4 === 0 ? 'NOUVEAU' : i % 5 === 0 ? 'ÉDITION LIMITÉE' : null,
    rating: 4.5 + (Number(p.id) % 5) * 0.1,
    reviews: 4 + (Number(p.id) % 16),
    leadWeeks: 2,
    description: p.description || 'Pièce atelier Épure Studio.',
  };
}

function mapTabToFilter(tab) {
  if (tab === 'all') return null;
  if (tab === 'mobilier') return 'mobilier';
  if (tab === 'luminaires') return 'luminaires';
  if (tab === 'travertin') return 'travertin';
  if (tab === 'editions') return 'editions';
  return null;
}

export default function Home({ cart, addToCart, setCartOpen }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [useDemo, setUseDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [cats, setCats] = useState(ALL_CATS);
  const [materials, setMaterials] = useState(['Travertin', 'Laiton Brossé']);
  const [maxPrice, setMaxPrice] = useState(2800);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [onOrder, setOnOrder] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState('grid');
  const [visible, setVisible] = useState(PAGE_STEP);
  const [matQ, setMatQ] = useState(() => searchParams.get('q') || '');
  const [wishToast, setWishToast] = useState('');
  const [catsOpen, setCatsOpen] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q != null) setMatQ(q);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getProducts();
        const list = (res.data || []).map(enrichApiProduct);
        if (!cancelled) {
          // Maquette boutique : catalogue démo si API vide ou trop pauvre
          if (list.length >= 4) {
            setProducts(list);
            setUseDemo(false);
          } else {
            setProducts(DEMO_SHOP_PRODUCTS);
            setUseDemo(true);
          }
        }
      } catch {
        if (!cancelled) {
          setProducts(DEMO_SHOP_PRODUCTS);
          setUseDemo(true);
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
    setVisible(PAGE_STEP);
  }, [tab, cats, materials, maxPrice, inStockOnly, onOrder, minRating, sort, matQ]);

  const filtered = useMemo(() => {
    const tabKey = mapTabToFilter(tab);
    let list = products.filter((p) => {
      if (tabKey && p.categoryKey && p.categoryKey !== tabKey) return false;

      if (cats.length && p.categoryKey) {
        const mapped =
          p.categoryKey === 'travertin'
            ? 'ceramiques'
            : p.categoryKey === 'editions'
              ? 'textiles'
              : p.categoryKey;
        if (!cats.includes(mapped) && !cats.includes(p.categoryKey)) return false;
      }

      if (Number(p.price) > maxPrice) return false;

      const stock = Number(p.stock ?? 0);
      if (inStockOnly && !onOrder && stock <= 0) return false;
      if (onOrder && !inStockOnly && stock > 0) return false;

      if (minRating && (p.rating || 0) < minRating) return false;
      if (materials.length && p.material && !materials.includes(p.material)) return false;

      if (matQ.trim()) {
        const q = matQ.toLowerCase();
        const hay = [p.name, p.material, p.description, p.category].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [
    products,
    tab,
    cats,
    materials,
    maxPrice,
    inStockOnly,
    onOrder,
    minRating,
    sort,
    matQ,
  ]);

  const totalCatalog = useDemo ? 48 : products.length || filtered.length;
  const shownCount = Math.min(visible, useDemo ? totalCatalog : filtered.length);
  const shown = useMemo(() => {
    if (!useDemo) return filtered.slice(0, visible);
    if (!filtered.length) return [];
    const out = [];
    for (let i = 0; i < shownCount; i += 1) {
      const src = filtered[i % filtered.length];
      out.push(i < filtered.length ? src : { ...src, id: `${src.id}-x${i}` });
    }
    return out;
  }, [filtered, visible, useDemo, shownCount]);
  const progress = Math.min(100, Math.round((shownCount / Math.max(totalCatalog, 1)) * 100));

  const toggleCat = (id) => {
    setCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleMat = (m) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const resetFilters = () => {
    setCats(ALL_CATS);
    setMaterials(['Travertin', 'Laiton Brossé']);
    setMaxPrice(2800);
    setInStockOnly(true);
    setOnOrder(false);
    setMinRating(0);
    setMatQ('');
    setTab('all');
  };

  const cartCount = (cart || []).reduce((s, i) => s + (i.quantity || 0), 0);
  const cartTotal = (cart || []).reduce(
    (s, i) => s + (i.price || i.Product?.price || 0) * (i.quantity || 0),
    0
  );

  return (
    <div className="ae-shop-page">
      <div className="ae-shop">
        <div className="ae-shop-crumb">
          Accueil <span className="accent">/ Catalogue permanent</span>
        </div>

        <header className="ae-shop-hero">
          <div>
            <p className="ae-shop-hero-kicker">Maison d’édition &amp; artisanat</p>
            <h1>Objets d’exception &amp; Design intemporel.</h1>
          </div>
          <p>
            Lignes sculpturales, matières nobles et finitions d’atelier — une curation permanente
            pour résidences et projets d’hospitalité.
          </p>
        </header>

        <div className="ae-shop-tabs">
          {SHOP_CATEGORY_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`ae-shop-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} ({useDemo ? t.count : filtered.length})
            </button>
          ))}
        </div>

        {useDemo && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 8,
              background: '#f6f4ef',
              border: '1px solid #e6d9c6',
              fontSize: '0.75rem',
              color: '#5c4a32',
            }}
          >
            Catalogue démo maquette — ajoutez des produits en admin pour basculer sur l’API.
          </div>
        )}
        {wishToast && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 8,
              background: '#e8f5ee',
              fontSize: '0.8rem',
              color: '#1f6b45',
            }}
          >
            {wishToast}
          </div>
        )}

        <div className="ae-shop-utility">
          <form
            className="ae-shop-utility-search"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <MdSearch size={18} aria-hidden />
            <input
              value={matQ}
              onChange={(e) => setMatQ(e.target.value)}
              placeholder="Rechercher une matière, une pièce…"
              aria-label="Rechercher une matière ou une pièce"
            />
          </form>
          <div className="ae-shop-utility-right">
            <label className="ae-shop-sort">
              <span>Trier par :</span>
              <select
                className="ae-shop-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="popular">Sélection Épure (Popularité)</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A–Z</option>
              </select>
            </label>
            <div className="ae-shop-view">
              <button
                type="button"
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
                aria-label="Grille"
              >
                <MdGridView size={18} />
              </button>
              <button
                type="button"
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                aria-label="Liste"
              >
                <MdViewList size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="ae-shop-layout">
          <aside className="ae-shop-filters">
            <div className="ae-shop-filters-head">
              <h3>
                <MdTune size={16} aria-hidden />
                Filtres
              </h3>
              <button type="button" className="ae-shop-reset" onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>

            <div className="ae-shop-filter-block">
              <button
                type="button"
                className="ae-shop-filter-toggle"
                onClick={() => setCatsOpen((o) => !o)}
                aria-expanded={catsOpen}
              >
                <h4>Catégories</h4>
                {catsOpen ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
              </button>
              {catsOpen &&
                SHOP_FILTER_CATEGORIES.map((c) => {
                  const on = cats.includes(c.id);
                  return (
                    <label key={c.id} className={`ae-shop-cat-row${on ? ' is-on' : ''}`}>
                      <span className="ae-shop-cat-main">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleCat(c.id)}
                        />
                        <span className="ae-shop-box" aria-hidden />
                        <span>{c.label}</span>
                      </span>
                      <span className="ae-shop-cat-count">{c.count}</span>
                    </label>
                  );
                })}
            </div>

            <div className="ae-shop-filter-block">
              <h4>Prix (€)</h4>
              <div className="ae-shop-price-val">Jusqu’à {maxPrice.toLocaleString('fr-FR')} €</div>
              <input
                className="ae-shop-range"
                type="range"
                min={120}
                max={4600}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>

            <div className="ae-shop-filter-block">
              <h4>Matériaux nobles</h4>
              <div className="ae-shop-materials">
                {SHOP_MATERIALS.map((m) => {
                  const on = materials.includes(m);
                  return (
                    <label key={m} className={`ae-shop-mat-tile${on ? ' is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleMat(m)}
                      />
                      <span className="ae-shop-box" aria-hidden />
                      <span>{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="ae-shop-filter-block">
              <h4>Disponibilité</h4>
              <label className={`ae-shop-avail${inStockOnly ? ' is-on' : ''}`}>
                <span className="ae-shop-avail-main">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span className="ae-shop-box" aria-hidden />
                  <span>En stock (Prêt à expédier)</span>
                </span>
                <span className="ae-shop-count ae-shop-count--ok">
                  {useDemo ? 32 : products.filter((p) => Number(p.stock) > 0).length}
                </span>
              </label>
              <label className={`ae-shop-avail${onOrder ? ' is-on' : ''}`}>
                <span className="ae-shop-avail-main">
                  <input
                    type="checkbox"
                    checked={onOrder}
                    onChange={(e) => setOnOrder(e.target.checked)}
                  />
                  <span className="ae-shop-box" aria-hidden />
                  <span>Sur commande (Atelier)</span>
                </span>
                <span className="ae-shop-count">
                  {useDemo ? 16 : products.filter((p) => Number(p.stock) <= 0).length}
                </span>
              </label>
            </div>

            <div className="ae-shop-filter-block ae-shop-filter-block--last">
              <h4>Évaluation</h4>
              <div className="ae-shop-stars">
                <button
                  type="button"
                  className={`ae-shop-rate${minRating === 5 ? ' is-on' : ''}`}
                  onClick={() => setMinRating((v) => (v === 5 ? 0 : 5))}
                >
                  <span className="ae-shop-rate-stars" aria-hidden>
                    ★★★★★
                  </span>
                  <span className="ae-shop-rate-label">5.0 (Exclusif)</span>
                  <span className="ae-shop-rate-count">19</span>
                </button>
                <button
                  type="button"
                  className={`ae-shop-rate${minRating === 4 ? ' is-on' : ''}`}
                  onClick={() => setMinRating((v) => (v === 4 ? 0 : 4))}
                >
                  <span className="ae-shop-rate-stars" aria-hidden>
                    ★★★★☆
                  </span>
                  <span className="ae-shop-rate-label">4.0 &amp; plus</span>
                  <span className="ae-shop-rate-count">29</span>
                </button>
              </div>
            </div>

            <div className="ae-shop-guarantee">
              <div className="ae-shop-guarantee-head">
                <MdVerified size={18} aria-hidden />
                <strong>Garantie Atelier Épure</strong>
              </div>
              <p>
                Matériaux certifiés éco-responsables, façonnage artisanal en Europe du Sud et
                certificat d’authenticité inclus.
              </p>
            </div>
          </aside>

          <div>
            <div className="ae-shop-status">
              <p className="ae-shop-status-meta">
                Affichage de <strong>{shownCount}</strong> pièces sélectionnées sur{' '}
                <strong>{totalCatalog}</strong> modèles d’exception
              </p>
              <p className="ae-shop-ship">
                Livraison offerte avec gants blancs dès 800 €
              </p>
            </div>

            {loading ? (
              <p style={{ color: '#8a8d93' }}>Chargement du catalogue…</p>
            ) : (
              <div className={`ae-shop-grid${view === 'list' ? ' list' : ''}`}>
                {shown.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOpen={(prod) => {
                      if (String(prod.id).startsWith('shop-') || prod._demo) {
                        addToCart?.(prod);
                        setWishToast(`${prod.name} ajouté au panier (démo)`);
                        setTimeout(() => setWishToast(''), 2000);
                        return;
                      }
                      navigate(`/product/${prod.id}`);
                    }}
                    onWish={(prod) => {
                      setWishToast(`${prod.name} ajouté aux favoris`);
                      setTimeout(() => setWishToast(''), 1800);
                    }}
                  />
                ))}
              </div>
            )}

            {!loading && shown.length === 0 && (
              <p style={{ color: '#8a8d93', marginTop: '1.5rem' }}>
                Aucune pièce ne correspond à vos filtres.
              </p>
            )}

            {shown.length > 0 && (
              <div className="ae-shop-more">
                <div className="ae-shop-more-meta">
                  <span>
                    {shownCount} sur {totalCatalog} articles affichés
                  </span>
                  <span className="ae-shop-more-pct">{progress}%</span>
                </div>
                <div className="ae-shop-progress" aria-hidden>
                  <i style={{ width: `${progress}%` }} />
                </div>
                {shownCount < totalCatalog ? (
                  <button
                    type="button"
                    className="ae-shop-more-btn"
                    onClick={() => setVisible((v) => v + PAGE_STEP)}
                  >
                    Découvrir plus de créations
                    <MdExpandMore size={20} />
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {cartCount > 0 && (
        <button
          type="button"
          className="ae-shop-float-cart"
          onClick={() => navigate('/panier')}
        >
          <FaShoppingBag size={14} aria-hidden />
          <span>Panier en cours</span>
          <strong>
            {cartTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </strong>
        </button>
      )}
    </div>
  );
}
