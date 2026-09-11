import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { getProducts } from '../../services/productsApi';

const CATEGORIES = ['Électronique', 'Livres', 'Vêtements', 'Maison', 'Sport', 'Autre'];

function getRandomCategory() {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

const Home = ({ cart, addToCart, handleCheckout }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => {
        const withCat = res.data.map((p) => ({
          ...p,
          category: p.category || getRandomCategory(),
        }));
        setProducts(withCat);
      })
      .catch((err) => console.error(err));
  }, []);

  let filtered = products.filter(
    (p) =>
      (!search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))) &&
      (!category || p.category === category) &&
      (!minPrice || p.price >= parseFloat(minPrice)) &&
      (!maxPrice || p.price <= parseFloat(maxPrice))
  );

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="ae-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <p className="ae-badge" style={{ marginBottom: '0.75rem' }}>
          Collection
        </p>
        <h1 className="ae-page-title">Atelier Épure</h1>
        <p className="ae-page-sub">
          Une sélection d’objets essentiels, présentés sans superflu.
        </p>
      </header>

      <div
        className="surface"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          padding: 16,
          marginBottom: '2rem',
          alignItems: 'center',
        }}
      >
        <input
          className="input"
          style={{ flex: '1 1 180px', minWidth: 160 }}
          type="text"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" style={{ flex: '0 1 140px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          className="input"
          style={{ width: 100 }}
          type="number"
          min="0"
          placeholder="Min €"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="input"
          style={{ width: 100 }}
          type="number"
          min="0"
          placeholder="Max €"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select className="input" style={{ flex: '0 1 160px' }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Trier</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name-asc">Nom A–Z</option>
          <option value="name-desc">Nom Z–A</option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filtered.map((product) => (
          <div key={product.id} className="ae-product-card" onClick={() => navigate(`/product/${product.id}`)}>
            <ProductCard product={product} />
            <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => addToCart(product)}>
                Ajouter
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate(`/product/${product.id}`)}>
                Voir
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--color-muted)', marginTop: '2rem' }}>Aucun produit ne correspond à vos filtres.</p>
      )}

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button type="button" className="btn btn-accent" onClick={handleCheckout}>
          Commander ({cartCount})
        </button>
      </div>
    </div>
  );
};

export default Home;
