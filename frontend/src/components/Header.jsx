import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { MdNotificationsNone, MdSearch, MdSettings } from 'react-icons/md';
import BrandLogo from './BrandLogo';
import { getProducts } from '../services/productsApi';

const shopLinks = [
  { to: '/home', label: 'Catalogue' },
  { to: '/artisanat', label: 'Artisanat d’Art' },
  { to: '/home', label: 'Collections', hash: 'collections' },
  { to: '/collection-privee', label: 'Collection Privée' },
];

export default function Header({ onCartClick, cartCount }) {
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const alertsRef = useRef(null);

  const isAdminSurface = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdmin || !isAdminSurface) return undefined;
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
  }, [isAdmin, isAdminSurface]);

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

  const submitAdminSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q.includes('@')) {
      navigate(`/admin/clients?q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/admin/products?q=${encodeURIComponent(q)}`);
    }
  };

  const submitShopSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/home?q=${encodeURIComponent(q)}`);
  };

  // Header boutique sans sidebar hors console admin
  if (!isAdminSurface) {
    return (
      <header className="ae-shop-header">
        <Link to="/home" className="ae-shop-brand" aria-label="Épure Studio — Accueil">
          <BrandLogo variant="shop" />
        </Link>

        <nav className="ae-shop-nav" aria-label="Boutique">
          {shopLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={location.pathname === l.to ? 'active' : undefined}
            >
              {l.label}
            </Link>
          ))}
          <button type="button" className="ae-shop-nav-link" onClick={onCartClick}>
            Panier
          </button>
        </nav>

        <form className="ae-shop-search" onSubmit={submitShopSearch}>
          <MdSearch size={18} aria-hidden />
          <input
            type="search"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Recherche boutique"
          />
        </form>

        <div className="ae-shop-header-actions">
          <button type="button" className="ae-shop-icon-btn" onClick={onCartClick} aria-label="Ouvrir le panier">
            <FaShoppingCart size={15} />
            {cartCount > 0 && <span className="ae-shop-cart-badge">{cartCount}</span>}
          </button>
          <button
            type="button"
            className="ae-shop-avatar"
            aria-label="Profil"
            onClick={() => navigate(role ? '/profile' : '/login')}
          >
            {(localStorage.getItem('user')
              ? JSON.parse(localStorage.getItem('user') || '{}').firstName?.[0] || 'C'
              : 'C'
            ).toUpperCase()}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className={`ae-header${isAdmin ? ' ae-header--admin' : ''}`}>
      {!isAdmin && (
        <div className="ae-header-brand">
          <BrandLogo variant="header" />
        </div>
      )}

      {isAdmin && (
        <form className="ae-admin-search" onSubmit={submitAdminSearch}>
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
    </header>
  );
}
