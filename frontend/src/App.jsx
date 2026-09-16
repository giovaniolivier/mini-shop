import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/shop/Home';
import CollectionPrivee from './pages/shop/CollectionPrivee';
import ArtisanatArt from './pages/shop/ArtisanatArt';
import CollectionsSignatures from './pages/shop/CollectionsSignatures';
import PrivateRoute from './components/PrivateRoute';
import ProductDetail from './pages/shop/ProductDetail';
import Checkout from './pages/shop/Checkout';
import Cart from './pages/shop/Cart';
import Profile from './pages/shop/Profile';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductNew from './pages/admin/AdminProductNew';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderNew from './pages/admin/AdminOrderNew';
import AdminClients from './pages/admin/AdminClients';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminFinances from './pages/admin/AdminFinances';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientOrders from './pages/client/ClientOrders';
import AppLayout from './layouts/AppLayout';
import useCart from './hooks/useCart';

function AppRoutes({
  cart,
  setCart,
  cartOpen,
  setCartOpen,
  handleOpenCart,
  cartCount,
  cartTotal,
  addToCart,
  removeFromCart,
  updateCartItem,
}) {
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleOpenCartPage = () => {
    setCartOpen(false);
    navigate('/panier');
  };

  return (
    <AppLayout
      cart={cart}
      cartOpen={cartOpen}
      setCartOpen={setCartOpen}
      handleOpenCart={handleOpenCartPage}
      cartCount={cartCount}
      cartTotal={cartTotal}
      handleCheckout={handleCheckout}
      removeFromCart={removeFromCart}
      updateCartItem={updateCartItem}
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <Home
              handleCheckout={handleCheckout}
              cart={cart}
              setCart={setCart}
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartItem={updateCartItem}
            />
          }
        />
        <Route
          path="/collection-privee"
          element={<CollectionPrivee addToCart={addToCart} />}
        />
        <Route path="/artisanat" element={<ArtisanatArt />} />
        <Route path="/collections" element={<CollectionsSignatures />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/product/:id"
          element={<ProductDetail onAddToCart={addToCart} openCart={() => navigate('/panier')} />}
        />
        <Route
          path="/panier"
          element={
            <Cart
              cart={cart}
              updateCartItem={updateCartItem}
              removeFromCart={removeFromCart}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              setCart={setCart}
              updateCartItem={updateCartItem}
              removeFromCart={removeFromCart}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin/products"
          element={
            <PrivateRoute role="admin">
              <AdminProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <PrivateRoute role="admin">
              <AdminProductNew />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute role="admin">
              <AdminOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders/new"
          element={
            <PrivateRoute role="admin">
              <AdminOrderNew />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <PrivateRoute role="admin">
              <AdminClients />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/marketing"
          element={
            <PrivateRoute role="admin">
              <AdminMarketing />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/finances"
          element={
            <PrivateRoute role="admin">
              <AdminFinances />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute role="admin">
              <AdminSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute role="admin">
              <AdminAnalytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/orders"
          element={
            <PrivateRoute>
              <ClientOrders />
            </PrivateRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}

function App() {
  const {
    cart,
    setCartState,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItem,
    handleOpenCart,
  } = useCart();

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
