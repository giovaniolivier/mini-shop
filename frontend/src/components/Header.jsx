import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { MdNotificationsNone, MdSearch, MdSettings } from 'react-icons/md';
import BrandLogo from './BrandLogo';
import { getProducts } from '../services/productsApi';

export default function Header({ onCartClick, cartCount }) {
  const role = localStorage.getItem('role');
  const showCart = role !== 'admin';
  const isAdmin = role === 'admin';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const alertsRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    getProducts()
      .then((res) => {
        if (cancelled) return;
        const list = (res.data || [])
          .filter((p) => (p.stock ?? 0) <= 3)
          .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
          .slice(0, 5);
        setLowStock(list);
      })
      .catch(() => {
        if (!cancelled) setLowStock([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!alertsOpen) return undefined;
    function onDoc(e) {
      if (alertsRef.current && !alertsRef.current.contains(e.target)) {
        setAlertsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [alertsOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q.includes('@')) {
      navigate(`/admin/clients?q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/admin/products?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className={`ae-header${isAdmin ? ' ae-header--admin' : ''}`}>
      {!isAdmin && (
        <div className="ae-header-brand">
          <BrandLogo variant="header" />
        </div>
      )}

      {isAdmin && (
        <form className="ae-admin-search" onSubmit={submitSearch}>
          <MdSearch size={18} aria-hidden />
          <input
            type="search"
            placeholder="Rechercher un produit, SKU, client…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Recherche admin"
          />
        </form>
      )}

      {!isAdmin && <div className="ae-header-spacer" />}

      {isAdmin && (
        <div className="ae-admin-tools" ref={alertsRef}>
          <button
            type="button"
            className="ae-tool-btn"
            aria-label="Notifications stock"
            onClick={() => setAlertsOpen((v) => !v)}
          >
            <MdNotificationsNone size={18} />
            {lowStock.length > 0 && <span className="ae-tool-dot" />}
          </button>
          <button
            type="button"
            className="ae-tool-btn"
            aria-label="Paramètres"
            onClick={() => navigate('/admin/settings')}
          >
            <MdSettings size={18} />
          </button>
          <button
            type="button"
            className="ae-tool-avatar"
            aria-label="Profil admin"
            onClick={() => navigate('/admin/settings')}
          >
            A
          </button>

          {alertsOpen && (
            <div className="ae-alerts-panel" role="dialog" aria-label="Alertes stock">
              <strong>Alertes stock</strong>
              {lowStock.length === 0 ? (
                <p>Aucun stock critique.</p>
              ) : (
                <ul>
                  {lowStock.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertsOpen(false);
                          navigate(`/admin/products?id=${p.id}`);
                        }}
                      >
                        {p.name} · {p.stock} restant{p.stock > 1 ? 's' : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {showCart && (
        <button type="button" className="ae-cart-btn" onClick={onCartClick} aria-label="Ouvrir le panier">
          <FaShoppingCart size={16} />
          {cartCount > 0 && <span className="ae-cart-count">{cartCount}</span>}
        </button>
      )}
    </header>
  );
}
