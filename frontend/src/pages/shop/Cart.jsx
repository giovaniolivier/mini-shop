import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdAdd,
  MdArrowForward,
  MdCheck,
  MdDeleteOutline,
  MdLocalOffer,
  MdLocalShipping,
  MdLock,
  MdRemove,
  MdShoppingBag,
  MdSupportAgent,
  MdVerified,
} from 'react-icons/md';
import { CHECKOUT_DEMO_ITEMS } from '../../data/checkoutDemo';
import '../../styles/cart.css';

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function itemName(item) {
  return item.Product?.name || item.name || 'Pièce';
}

function itemImage(item) {
  return item.Product?.image_url || item.image_url || '';
}

function itemId(item) {
  return item.ProductId || item.productId || item.id;
}

function itemDetail(item) {
  return (
    item.detail ||
    item.Product?.material ||
    item.Product?.description ||
    'Pièce d’atelier Épure'
  );
}

const STEPS = [
  { id: 'panier', label: 'Panier' },
  { id: 'livraison', label: 'Livraison' },
  { id: 'paiement', label: 'Paiement' },
  { id: 'confirmation', label: 'Confirmation' },
];

export default function Cart({ cart = [], updateCartItem, removeFromCart }) {
  const navigate = useNavigate();
  const [localItems, setLocalItems] = useState(CHECKOUT_DEMO_ITEMS);
  const [promoInput, setPromoInput] = useState('EPUREVIP');
  const [promoApplied, setPromoApplied] = useState(true);
  const [toast, setToast] = useState('');

  const liveCart = useMemo(
    () => (cart || []).filter((i) => i.Product || i.name),
    [cart]
  );
  const usingDemo = liveCart.length === 0;
  const items = usingDemo ? localItems : liveCart;

  const subtotalTtc = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * (i.quantity || 0),
    0
  );
  const ht = Math.round((subtotalTtc / 1.2) * 100) / 100;
  const tva = Math.round((subtotalTtc - ht) * 100) / 100;
  const shipping = promoApplied ? 0 : 15;
  const totalTtc = Math.round((subtotalTtc + shipping) * 100) / 100;
  const count = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const setQty = (id, qty) => {
    const next = Math.max(1, qty);
    if (usingDemo) {
      setLocalItems((prev) =>
        prev.map((i) => (itemId(i) === id ? { ...i, quantity: next } : i))
      );
      return;
    }
    if (typeof updateCartItem === 'function') updateCartItem(id, next);
  };

  const removeItem = (id) => {
    if (usingDemo) {
      setLocalItems((prev) => prev.filter((i) => itemId(i) !== id));
      flash('Article retiré du panier.');
      return;
    }
    if (typeof removeFromCart === 'function') {
      removeFromCart(id);
      flash('Article retiré du panier.');
    }
  };

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === 'EPUREVIP') {
      setPromoApplied(true);
      flash('Code EPUREVIP appliqué.');
    } else {
      setPromoApplied(false);
      flash('Code promo non reconnu.');
    }
  };

  return (
    <div className="ae-cart">
      {toast ? <div className="ae-cart-toast">{toast}</div> : null}

      <div className="ae-cart-inner">
        <header className="ae-cart-head">
          <div>
            <p className="ae-cart-kicker">Sélection atelier</p>
            <h1>Votre panier</h1>
            <p className="ae-cart-lead">
              Vérifiez vos pièces, quantités et avantages Studio avant de
              finaliser l’expédition sécurisée.
            </p>
          </div>

          <ol className="ae-cart-steps">
            {STEPS.map((s, i) => {
              const active = i === 0;
              return (
                <li key={s.id} className={`ae-cart-step${active ? ' is-active' : ''}`}>
                  <span className="ae-cart-step-index" aria-hidden>
                    {active ? <MdCheck size={14} /> : null}
                  </span>
                  {s.label}
                </li>
              );
            })}
          </ol>
        </header>

        {!items.length ? (
          <section className="ae-cart-empty">
            <MdShoppingBag size={36} aria-hidden />
            <h2>Votre panier est vide</h2>
            <p>Parcourez le catalogue pour composer votre sélection d’atelier.</p>
            <Link to="/home" className="ae-cart-btn ae-cart-btn-dark">
              Voir le catalogue
            </Link>
          </section>
        ) : (
          <div className="ae-cart-layout">
            <section className="ae-cart-main">
              <div className="ae-cart-card">
                <div className="ae-cart-card-head">
                  <div>
                    <h2>
                      Articles sélectionnés
                      <em>
                        {count} pièce{count > 1 ? 's' : ''}
                      </em>
                    </h2>
                    <p>Quantités ajustables — emballage atelier à l’expédition.</p>
                  </div>
                  <Link to="/home" className="ae-cart-continue">
                    Continuer vos achats
                  </Link>
                </div>

                <ul className="ae-cart-list">
                  {items.map((item) => {
                    const id = itemId(item);
                    return (
                      <li key={id} className="ae-cart-line">
                        <div className="ae-cart-line-media">
                          <img src={itemImage(item)} alt="" />
                        </div>
                        <div className="ae-cart-line-body">
                          <strong>{itemName(item)}</strong>
                          <span>{itemDetail(item)}</span>
                          <div className="ae-cart-line-actions">
                            <div className="ae-cart-qty">
                              <button
                                type="button"
                                aria-label="Diminuer"
                                onClick={() => setQty(id, (item.quantity || 1) - 1)}
                              >
                                <MdRemove size={14} />
                              </button>
                              <em>{item.quantity}</em>
                              <button
                                type="button"
                                aria-label="Augmenter"
                                onClick={() => setQty(id, (item.quantity || 1) + 1)}
                              >
                                <MdAdd size={14} />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="ae-cart-remove"
                              onClick={() => removeItem(id)}
                            >
                              <MdDeleteOutline size={15} aria-hidden />
                              Supprimer
                            </button>
                          </div>
                        </div>
                        <div className="ae-cart-line-price">
                          <strong>{formatEuro(Number(item.price) * item.quantity)}</strong>
                          <span>{formatEuro(item.price)} / unité</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="ae-cart-reassure">
                <div>
                  <MdLocalShipping size={18} aria-hidden />
                  <div>
                    <strong>Expédition d’art &amp; mobilier</strong>
                    <p>Calage minéral recyclé et suivi sécurisé.</p>
                  </div>
                </div>
                <div>
                  <MdVerified size={18} aria-hidden />
                  <div>
                    <strong>Certificat d’authenticité</strong>
                    <p>Remis avec chaque pièce numérotée.</p>
                  </div>
                </div>
                <div>
                  <MdSupportAgent size={18} aria-hidden />
                  <div>
                    <strong>Conciergerie atelier</strong>
                    <p>Accompagnement sur rendez-vous privé.</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="ae-cart-aside">
              <div className="ae-cart-summary">
                <h2>
                  <MdShoppingBag size={18} aria-hidden />
                  Récapitulatif
                </h2>

                <div className="ae-cart-promo-row">
                  <label className="ae-cart-promo-field">
                    <MdLocalOffer size={16} aria-hidden />
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      aria-label="Code promo"
                    />
                  </label>
                  <button type="button" className="ae-cart-promo-btn" onClick={applyPromo}>
                    Appliquer
                  </button>
                </div>
                {promoApplied ? (
                  <p className="ae-cart-promo-ok">
                    <MdCheck size={14} aria-hidden />
                    Code EPUREVIP : frais de port offerts et traitement prioritaire
                  </p>
                ) : null}

                <dl className="ae-cart-totals">
                  <div>
                    <dt>Sous-total articles (HT)</dt>
                    <dd>{formatEuro(ht)}</dd>
                  </div>
                  <div>
                    <dt>TVA légale (20%)</dt>
                    <dd>{formatEuro(tva)}</dd>
                  </div>
                  <div>
                    <dt>Livraison estimée</dt>
                    <dd>{shipping === 0 ? 'Offerte' : formatEuro(shipping)}</dd>
                  </div>
                  <div className="ae-cart-total">
                    <dt>Total TTC</dt>
                    <dd>{formatEuro(totalTtc)}</dd>
                  </div>
                </dl>
                <p className="ae-cart-currency">Devise : EUR (€) · Taxes incluses</p>

                <button
                  type="button"
                  className="ae-cart-btn ae-cart-btn-dark ae-cart-cta"
                  onClick={() => navigate('/checkout')}
                >
                  <MdLock size={16} aria-hidden />
                  Passer au paiement {formatEuro(totalTtc)}
                  <MdArrowForward size={16} aria-hidden />
                </button>

                <Link to="/checkout" className="ae-cart-secondary">
                  Finaliser livraison &amp; paiement →
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
