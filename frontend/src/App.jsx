import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard'; // Exemple de page privée
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminClients from './pages/AdminClients';
import AdminMarketing from './pages/AdminMarketing';
import AdminFinances from './pages/AdminFinances';
import AdminSettings from './pages/AdminSettings';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import React, { useRef, useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';
import ClientSidebar from './components/ClientSidebar';
import axios from 'axios';
import ClientOrders from './pages/ClientOrders';

function Layout({ children, cart, setCart, cartOpen, setCartOpen, cartCount, cartTotal, handleCheckout, addToCart, removeFromCart, updateCartItem, handleOpenCart }) {
  const location = useLocation();
  const miniCartRef = useRef();

  useEffect(() => {
    if (!cartOpen) return;
    function handleClickOutside(event) {
      if (miniCartRef.current && !miniCartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartOpen, setCartOpen]);

  // On masque la sidebar et le header sur login/register
  const hideLayout = ['/login', '/register', '/'].includes(location.pathname);
  const role = localStorage.getItem('role');

  return (
    <div>
      {!hideLayout && (role === 'admin' ? <AdminSidebar /> : <ClientSidebar />)}
      {!hideLayout && <Header onCartClick={handleOpenCart} cartCount={cartCount} />}
      <div style={{ marginLeft: !hideLayout ? 240 : 0, marginTop: !hideLayout ? 10 : 0, minHeight: '100vh', background: '#fafbfc' }}>
        {children}
      </div>
      {/* Mini-panier global */}
      {cartOpen && (
        <div ref={miniCartRef} style={{ position: 'fixed', top: 0, right: 0, width: 370, height: '100vh', background: '#fff', boxShadow: '-4px 0 24px #e0e0e0', zIndex: 3000, display: 'flex', flexDirection: 'column', padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, color: '#1976d2', fontWeight: 800 }}>Mon panier</h2>
            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: 26, color: '#888', cursor: 'pointer' }}>&times;</button>
          </div>
          {cart.length === 0 ? (
            <div style={{ color: '#888', fontSize: 17, textAlign: 'center', marginTop: 60 }}>Votre panier est vide.</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cart.filter(item => item.ProductId || item.productId || item.id).map(item => {
                  console.log('Mini-panier item:', item);
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                      <img src={item.Product?.image_url || item.image_url} alt={item.Product?.name || item.name} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10, boxShadow: '0 1px 6px #e0e0e0' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 16 }}>{item.Product?.name || item.name}</div>
                        <div style={{ color: '#555', fontSize: 15 }}>{item.price} € x {item.quantity}</div>
                        <div style={{ color: '#888', fontSize: 14 }}>Total : {(item.price * item.quantity).toFixed(2)} €</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button onClick={() => updateCartItem(item.ProductId || item.productId || item.id, item.quantity + 1)} style={{ background: '#e3f2fd', border: 'none', borderRadius: 8, fontWeight: 700, color: '#1976d2', fontSize: 18, padding: '2px 8px', cursor: 'pointer' }}>+</button>
                        <button onClick={() => updateCartItem(item.ProductId || item.productId || item.id, Math.max(1, item.quantity - 1))} style={{ background: '#e3f2fd', border: 'none', borderRadius: 8, fontWeight: 700, color: '#1976d2', fontSize: 18, padding: '2px 8px', cursor: 'pointer' }}>-</button>
                        <button onClick={() => removeFromCart(item.ProductId || item.productId || item.id)} style={{ background: '#ffe0e0', border: 'none', borderRadius: 8, fontWeight: 700, color: '#e53935', fontSize: 15, padding: '2px 8px', cursor: 'pointer' }}>Suppr.</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 18, marginTop: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#222', marginBottom: 8 }}>Total : {cartTotal.toFixed(2)} €</div>
                <button style={{ background: 'linear-gradient(90deg, #43a047 0%, #a5d6a7 100%)', color: '#fff', border: 'none', borderRadius: 18,marginBottom: '40px', padding: '12px 36px', fontWeight: 800, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0e0', width: '100%' }} onClick={handleCheckout}>Commander</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AppRoutes({ cart, setCart, cartOpen, setCartOpen, handleOpenCart, cartCount, cartTotal, addToCart, removeFromCart, updateCartItem }) {
  const navigate = useNavigate();

  // Fonction unique pour commander
  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Layout cart={cart} setCart={setCart} cartOpen={cartOpen} setCartOpen={setCartOpen} handleOpenCart={handleOpenCart} cartCount={cartCount} cartTotal={cartTotal} handleCheckout={handleCheckout} addToCart={addToCart} removeFromCart={removeFromCart} updateCartItem={updateCartItem}>
      <Routes>
        {/* Page affichée par défaut */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home handleCheckout={handleCheckout} cart={cart} setCart={setCart} cartOpen={cartOpen} setCartOpen={setCartOpen} addToCart={addToCart} removeFromCart={removeFromCart} updateCartItem={updateCartItem} />} />
        {/* Route protégée */}
        <Route path="/dashboard" element={<PrivateRoute><ClientDashboard /></PrivateRoute>} />
        <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} openCart={() => setCartOpen(true)} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/products" element={<PrivateRoute role="admin"><AdminProducts /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute role="admin"><AdminOrders /></PrivateRoute>} />
        <Route path="/admin/clients" element={<PrivateRoute role="admin"><AdminClients /></PrivateRoute>} />
        <Route path="/admin/marketing" element={<PrivateRoute role="admin"><AdminMarketing /></PrivateRoute>} />
        <Route path="/admin/finances" element={<PrivateRoute role="admin"><AdminFinances /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute role="admin"><AdminSettings /></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute role="admin"><AdminAnalytics /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/client/orders" element={<PrivateRoute><ClientOrders /></PrivateRoute>} />
      </Routes>
    </Layout>
  );
}

function App() {
  // État du panier au niveau App (API backend)
  const CLIENT_ID = 'demo'; // À remplacer par l'email ou l'id utilisateur réel si disponible
  const [cartState, setCartState] = React.useState({ items: [], total: 0 });
  const [cartOpen, setCartOpen] = React.useState(false);

  // Charger le panier depuis l'API au démarrage
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        // Nettoyage : on ne garde que les items qui ont un Product associé
        const items = (res.data.items || []).filter(item => item.Product);
        setCartState({
          items,
          total: res.data.total || 0
        });
        // setCartOpen(true); // Suppression de l'ouverture automatique du mini-panier
      })
      .catch(err => console.error('Erreur chargement panier', err));
  }, []);

  // Fonctions pour manipuler le panier via l'API
  const addToCart = (product) => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/cart/add', {
      productId: product.id,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        // Nettoyage : on ne garde que les items qui ont un Product associé
        const items = (res.data.items || []).filter(item => item.Product);
        setCartState({
          items,
          total: res.data.total || 0
        });
      })
      .catch(err => alert('Erreur ajout au panier : ' + (err.response?.data?.message || err.message)));
  };

  const removeFromCart = (productId) => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/cart/remove', {
      productId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        // Nettoyage : on ne garde que les items qui ont un Product associé
        const items = (res.data.items || []).filter(item => item.Product);
        setCartState({
          items,
          total: res.data.total || 0
        });
      })
      .catch(err => alert('Erreur suppression du panier : ' + (err.response?.data?.message || err.message)));
  };

  const updateCartItem = (productId, quantity) => {
    console.log('updateCartItem called with:', { productId, quantity });
    if (!productId || !quantity) {
      alert('Erreur : identifiant produit ou quantité manquant');
      return;
    }
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/cart/update', {
      productId,
      quantity
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        // Nettoyage : on ne garde que les items qui ont un Product associé
        const items = (res.data.items || []).filter(item => item.Product);
        setCartState({
          items,
          total: res.data.total || 0
        });
      })
      .catch(err => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') {
          // Recharge le panier depuis l'API (comportement précédent)
          axios.get('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => {
              const items = (res.data.items || []).filter(item => item.Product);
              setCartState({
                items,
                total: res.data.total || 0
              });
            });
          alert("Ce produit n'est plus dans votre panier. Le panier a été rechargé.");
        } else {
          alert('Erreur modification quantité : ' + (err.response?.data?.message || err.message));
        }
      });
  };

  // Nouvelle fonction pour ouvrir le mini-panier en rechargeant le panier
  const handleOpenCart = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        // Nettoyage : on ne garde que les items qui ont un Product associé
        const items = (res.data.items || []).filter(item => item.Product);
        setCartState({
          items,
          total: res.data.total || 0
        });
        setCartOpen(true);
      });
  };

  // Calculs
  const cart = cartState.items;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Router>
      <AppRoutes
        cart={cart}
        setCart={setCartState}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        handleOpenCart={handleOpenCart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        updateCartItem={updateCartItem}
      />
    </Router>
  );
}

export default App;
