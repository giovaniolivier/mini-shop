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
          marginLeft: !hideLayout ? 'var(--sidebar-width)' : 0,
          minHeight: '100vh',
          padding: !hideLayout ? '1.5rem 1.75rem 2.5rem' : 0,
        }}
      >
        {children}
      </div>
      {cartOpen && (
        <div ref={miniCartRef} className="ae-minicart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Panier</h2>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.7rem' }}
              onClick={() => setCartOpen(false)}
            >
              ✕
            </button>
          </div>
          {cart.length === 0 ? (
            <div style={{ color: 'var(--color-muted)', textAlign: 'center', marginTop: '3rem' }}>
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
                        marginBottom: 16,
                        paddingBottom: 12,
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <img
                        src={item.Product?.image_url || item.image_url}
                        alt={item.Product?.name || item.name}
                        style={{
                          width: 56,
                          height: 56,
                          objectFit: 'cover',
                          borderRadius: 10,
                          background: '#ebe9e4',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {item.Product?.name || item.name}
                        </div>
                        <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                          {item.price} € × {item.quantity}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px' }}
                          onClick={() =>
                            updateCartItem(item.ProductId || item.productId || item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px' }}
                          onClick={() =>
                            updateCartItem(
                              item.ProductId || item.productId || item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '2px 8px', fontSize: 12 }}
                          onClick={() => removeFromCart(item.ProductId || item.productId || item.id)}
                        >
                          Suppr.
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Total : {cartTotal.toFixed(2)} €</div>
                <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleCheckout}>
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
