import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

// Catégories fictives pour la démo
const CATEGORIES = ['Électronique', 'Livres', 'Vêtements', 'Maison', 'Sport', 'Autre'];

function getRandomCategory() {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

const CLIENT_ID = 'demo'; // À remplacer par l'email ou l'id utilisateur réel si disponible

const Home = ({ handleCheckout, cart, setCart, cartOpen, setCartOpen, addToCart, removeFromCart, updateCartItem, clearCart }) => {
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

  // Charger les produits
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        // On simule des catégories si elles n'existent pas
        const withCat = res.data.map(p => ({ ...p, category: p.category || getRandomCategory() }));
        setProducts(withCat);
      })
      .catch(err => console.error(err));
  }, []);

  // Mémoriser la sélection des recommandations une seule fois
  useEffect(() => {
    if (products.length > 0 && recommended.length === 0) {
      setRecommended([...products].sort(() => 0.5 - Math.random()).slice(0, 3));
    }
  }, [products, recommended.length]);

  // Filtres et recherche
  let filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase()))) &&
    (!category || p.category === category) &&
    (!minPrice || p.price >= parseFloat(minPrice)) &&
    (!maxPrice || p.price <= parseFloat(maxPrice))
  );
  // Tri
  if (sort === 'price-asc') filtered = filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered = filtered.sort((a, b) => b.price - a.price);
  if (sort === 'name-asc') filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));

  // Recommandations (3 produits aléatoires)
  const recommendedIds = recommended.map(p => p.id);
  const filteredWithoutRecommended = filtered.filter(p => !recommendedIds.includes(p.id));

  // Styles modernes (repris du dashboard)
  const pageStyle = {
    padding: '2rem',
    maxWidth: 1200,
    margin: '0 auto',
    background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)',
    minHeight: '100vh',
  };
  const h1Style = {
    fontSize: 32,
    fontWeight: 800,
    color: '#1976d2',
    marginBottom: 32,
    letterSpacing: 1,
  };
  const gridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'flex-start',
  };
  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px #e0e0e0',
    padding: 24,
    minWidth: 260,
    maxWidth: 280,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  const filterBar = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
    alignItems: 'center',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px #ececec',
    padding: 16,
  };
  const inputStyle = {
    border: '1px solid #bbb',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 16,
    outline: 'none',
  };
  const selectStyle = { ...inputStyle, minWidth: 120 };
  const labelStyle = { fontWeight: 600, color: '#1976d2', marginRight: 4 };

  // Calcul du total panier (utilise le panier global)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItems = cart;

  const goToCheckout = () => {
    if (cartItems.length === 0) return alert('Votre panier est vide !');
    navigate('/checkout');
  };

  return (
    <div style={pageStyle}>
      {/* Icône panier en bas à droite */}
      <div style={{ position: 'fixed', bottom: 32, right: 48, zIndex: 2000 }}>
        <button onClick={() => setCartOpen(true)} style={{ background: '#fff', border: 'none', borderRadius: 24, boxShadow: '0 2px 12px #ececec', padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaShoppingCart size={22} color="#1976d2" />
          <span style={{ fontWeight: 700, color: '#1976d2', fontSize: 16 }}>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </button>
      </div>
      {/* Panneau latéral mini-panier */}
      {cartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 370, height: '100vh', background: '#fff', boxShadow: '-4px 0 24px #e0e0e0', zIndex: 3000, display: 'flex', flexDirection: 'column', padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, color: '#1976d2', fontWeight: 800 }}>Mon panier</h2>
            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: 26, color: '#888', cursor: 'pointer' }}>&times;</button>
          </div>
          {cartItems.length === 0 ? (
            <div style={{ color: '#888', fontSize: 17, textAlign: 'center', marginTop: 60 }}>Votre panier est vide.</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                    <img src={item.image_url} alt={item.name} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10, boxShadow: '0 1px 6px #e0e0e0' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 16 }}>{item.name}</div>
                      <div style={{ color: '#555', fontSize: 15 }}>{item.price} € x {item.quantity}</div>
                      <div style={{ color: '#888', fontSize: 14 }}>Total : {(item.price * item.quantity).toFixed(2)} €</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={() => updateCartItem(item.ProductId, item.quantity + 1)} style={{ background: '#e3f2fd', border: 'none', borderRadius: 8, fontWeight: 700, color: '#1976d2', fontSize: 18, padding: '2px 8px', cursor: 'pointer' }}>+</button>
                      <button onClick={() => updateCartItem(item.ProductId, Math.max(1, item.quantity - 1))} style={{ background: '#e3f2fd', border: 'none', borderRadius: 8, fontWeight: 700, color: '#1976d2', fontSize: 18, padding: '2px 8px', cursor: 'pointer' }}>-</button>
                      <button onClick={() => removeFromCart(item.ProductId)} style={{ background: '#ffe0e0', border: 'none', borderRadius: 8, fontWeight: 700, color: '#e53935', fontSize: 15, padding: '2px 8px', cursor: 'pointer' }}>Suppr.</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 18, marginTop: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#222', marginBottom: 8 }}>Total : {cartTotal.toFixed(2)} €</div>
                <button style={{ background: 'linear-gradient(90deg, #43a047 0%, #a5d6a7 100%)', color: '#fff', border: 'none', borderRadius: 18, padding: '12px 36px', fontWeight: 800, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0e0', width: '100%' }} onClick={handleCheckout}>Commander</button>
              </div>
            </>
          )}
        </div>
      )}
      <h1 style={h1Style}>Nos produits</h1>

      {/* Barre de recherche et filtres */}
      <div style={filterBar}>
        <label style={labelStyle}>Recherche :</label>
        <input style={inputStyle} type="text" placeholder="Nom ou description..." value={search} onChange={e => setSearch(e.target.value)} />
        <label style={labelStyle}>Catégorie :</label>
        <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Toutes</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <label style={labelStyle}>Prix min :</label>
        <input style={{ ...inputStyle, width: 80 }} type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <label style={labelStyle}>Prix max :</label>
        <input style={{ ...inputStyle, width: 80 }} type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        <label style={labelStyle}>Tri :</label>
        <select style={selectStyle} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Aucun</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name-asc">Nom A-Z</option>
          <option value="name-desc">Nom Z-A</option>
        </select>
      </div>

      {/* Recommandations personnalisées */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, color: '#388e3c', marginBottom: 16 }}>Recommandé pour vous</h2>
        <div style={gridStyle}>
          {recommended.map(product => {
            const cartBtn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 18px', margin: '8px 0', fontWeight: 700, cursor: 'pointer', fontSize: 15 };
            return (
              <div key={product.id} style={cardStyle}>
                {/* Image */}
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
                )}
                {/* Nom */}
                <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 18, marginBottom: 6 }}>{product.name}</div>
                {/* Catégorie */}
                <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>{product.category}</div>
                {/* Prix */}
                <div style={{ color: '#222', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{product.price} €</div>
                <button style={cartBtn} onClick={() => addToCart(product)}>Ajouter au panier</button>
                <button style={inputStyle} onClick={() => navigate(`/product/${product.id}`)}>Voir détail</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catalogue filtré */}
      <div style={gridStyle}>
        {filteredWithoutRecommended.length === 0 ? null :
          filteredWithoutRecommended.map(product => {
            const cartBtn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 18px', margin: '8px 0', fontWeight: 700, cursor: 'pointer', fontSize: 15 };
            return (
              <div key={product.id} style={cardStyle}>
                {/* Image */}
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
                )}
                {/* Nom */}
                <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 18, marginBottom: 6 }}>{product.name}</div>
                {/* Catégorie */}
                <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>{product.category}</div>
                {/* Prix */}
                <div style={{ color: '#222', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{product.price} €</div>
                <button style={cartBtn} onClick={() => addToCart(product)}>Ajouter au panier</button>
                <button style={inputStyle} onClick={() => navigate(`/product/${product.id}`)}>Voir détail</button>
              </div>
            );
          })}
      </div>

      {/* Bouton commander */}
      <div style={{ textAlign: 'center', margin: '40px 0 0 0' }}>
        <button style={{ background: 'linear-gradient(90deg, #43a047 0%, #a5d6a7 100%)', color: '#fff', border: 'none', borderRadius: 18, padding: '12px 36px', fontWeight: 800, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0e0' }} onClick={handleCheckout}>
          Commander ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>
    </div>
  );
};

export default Home;
