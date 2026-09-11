import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import ClientSidebar from '../components/ClientSidebar';
import Header from '../components/Header';

export default function AppLayout({
  children,
  cart,
  cartOpen,
  setCartOpen,
  cartTotal,
  handleCheckout,
  removeFromCart,
  updateCartItem,
  handleOpenCart,
  cartCount,
}) {
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cartOpen, setCartOpen]);

  const hideLayout = ['/login', '/register', '/'].includes(location.pathname);
  const role = localStorage.getItem('role');

  return (
    <div>
      {!hideLayout && (role === 'admin' ? <AdminSidebar /> : <ClientSidebar />)}
      {!hideLayout && <Header onCartClick={handleOpenCart} cartCount={cartCount} />}
      <div
        style={{
          marginLeft: !hideLayout ? 240 : 0,
          marginTop: !hideLayout ? 10 : 0,
          minHeight: '100vh',
          background: '#fafbfc',
        }}
      >
        {children}
      </div>
      {cartOpen && (
        <div
          ref={miniCartRef}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 370,
            height: '100vh',
            background: '#fff',
            boxShadow: '-4px 0 24px #e0e0e0',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            padding: 28,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, color: '#1976d2', fontWeight: 800 }}>Mon panier</h2>
            <button
              onClick={() => setCartOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: 26, color: '#888', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>
          {cart.length === 0 ? (
            <div style={{ color: '#888', fontSize: 17, textAlign: 'center', marginTop: 60 }}>
              Votre panier est vide.
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cart
                  .filter((item) => item.ProductId || item.productId || item.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 18,
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: 10,
                      }}
                    >
                      <img
                        src={item.Product?.image_url || item.image_url}
                        alt={item.Product?.name || item.name}
                        style={{
                          width: 54,
                          height: 54,
                          objectFit: 'cover',
                          borderRadius: 10,
                          boxShadow: '0 1px 6px #e0e0e0',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 16 }}>
                          {item.Product?.name || item.name}
                        </div>
                        <div style={{ color: '#555', fontSize: 15 }}>
                          {item.price} € x {item.quantity}
                        </div>
                        <div style={{ color: '#888', fontSize: 14 }}>
                          Total : {(item.price * item.quantity).toFixed(2)} €
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          onClick={() =>
                            updateCartItem(item.ProductId || item.productId || item.id, item.quantity + 1)
                          }
                          style={{
                            background: '#e3f2fd',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            color: '#1976d2',
                            fontSize: 18,
                            padding: '2px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            updateCartItem(
                              item.ProductId || item.productId || item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          style={{
                            background: '#e3f2fd',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            color: '#1976d2',
                            fontSize: 18,
                            padding: '2px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <button
                          onClick={() => removeFromCart(item.ProductId || item.productId || item.id)}
                          style={{
                            background: '#ffe0e0',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            color: '#e53935',
                            fontSize: 15,
                            padding: '2px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          Suppr.
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 18, marginTop: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#222', marginBottom: 8 }}>
                  Total : {cartTotal.toFixed(2)} €
                </div>
                <button
                  style={{
                    background: 'linear-gradient(90deg, #43a047 0%, #a5d6a7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 18,
                    marginBottom: '40px',
                    padding: '12px 36px',
                    fontWeight: 800,
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #e0e0e0',
                    width: '100%',
                  }}
                  onClick={handleCheckout}
                >
                  Commander
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
