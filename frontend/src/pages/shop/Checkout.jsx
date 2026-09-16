import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdAdd,
  MdAddCircleOutline,
  MdBusiness,
  MdCheck,
  MdCreditCard,
  MdBolt,
  MdEco,
  MdHelpOutline,
  MdHome,
  MdLocalOffer,
  MdLock,
  MdRemove,
  MdShield,
  MdShoppingBag,
  MdStorefront,
  MdSwapHoriz,
  MdDeleteOutline,
  MdVerifiedUser,
} from 'react-icons/md';
import { FaApple } from 'react-icons/fa';
import {
  CHECKOUT_ADDRESSES,
  CHECKOUT_DEMO_ITEMS,
  CHECKOUT_SHIPPING,
} from '../../data/checkoutDemo';
import { createOrder } from '../../services/ordersApi';
import * as cartApi from '../../services/cartApi';
import '../../styles/checkout.css';

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

const ADDR_ICONS = { home: MdHome, business: MdBusiness };
const SHIP_ICONS = { eco: MdEco, bolt: MdBolt, store: MdStorefront };

export default function Checkout({
  cart = [],
  setCart,
  updateCartItem,
  removeFromCart,
}) {
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState(
    CHECKOUT_ADDRESSES.find((a) => a.default)?.id || CHECKOUT_ADDRESSES[0].id
  );
  const [shippingId, setShippingId] = useState('standard');
  const [payTab, setPayTab] = useState('card');
  const [promoInput, setPromoInput] = useState('EPUREVIP');
  const [promoApplied, setPromoApplied] = useState(true);
  const [localItems, setLocalItems] = useState(CHECKOUT_DEMO_ITEMS);
  const [saveCard, setSaveCard] = useState(true);
  const [sameBilling, setSameBilling] = useState(true);
  const [card, setCard] = useState({
    number: '4532 **** **** 8819',
    name: 'ALEXANDRE DE SAINT-GERMAIN',
    exp: '09/27',
    cvv: '•••',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState('');

  const liveCart = useMemo(
    () => (cart || []).filter((i) => i.Product || i.name),
    [cart]
  );
  const usingDemo = liveCart.length === 0;
  const items = usingDemo ? localItems : liveCart;

  const shipping = CHECKOUT_SHIPPING.find((s) => s.id === shippingId) || CHECKOUT_SHIPPING[0];
  const subtotalTtc = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * (i.quantity || 0),
    0
  );
  const effectiveShipping = shipping.price || 0;
  const ht = Math.round((subtotalTtc / 1.2) * 100) / 100;
  const tva = Math.round((subtotalTtc - ht) * 100) / 100;
  const totalTtc = Math.round((subtotalTtc + effectiveShipping) * 100) / 100;

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
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
      return;
    }
    if (typeof removeFromCart === 'function') removeFromCart(id);
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

  const handlePay = async () => {
    if (!items.length) {
      flash('Votre panier est vide.');
      return;
    }
    setBusy(true);
    try {
      const apiItems = items.filter((i) => !i._demo && !String(itemId(i)).startsWith('shop-'));
      if (apiItems.length) {
        await createOrder(
          apiItems.map((item) => ({
            productId: itemId(item),
            quantity: item.quantity,
          }))
        );
        await cartApi.clearCart().catch(() => {});
      }
      if (typeof setCart === 'function') setCart({ items: [], total: 0 });
      setLocalItems([]);
      setDone(true);
      flash('Paiement confirmé — merci pour votre commande.');
    } catch (err) {
      flash(err.response?.data?.message || err.message || 'Paiement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const currentStep = done ? 3 : 2;

  return (
    <div className="ae-chk">
      {toast ? <div className="ae-chk-toast">{toast}</div> : null}

      <div className="ae-chk-inner">
        <header className="ae-chk-head">
          <div>
            <p className="ae-chk-kicker">Finalisation de commande</p>
            <h1>Paiement &amp; Expédition Sécurisés</h1>
          </div>

          <ol className="ae-chk-steps">
            {STEPS.map((s, i) => {
              const doneStep = i < currentStep;
              const active = i === currentStep;
              return (
                <li
                  key={s.id}
                  className={`ae-chk-step${doneStep ? ' is-done' : ''}${
                    active ? ' is-active' : ''
                  }`}
                >
                  <span className="ae-chk-step-index" aria-hidden>
                    {doneStep ? <MdCheck size={14} /> : null}
                  </span>
                  {s.label}
                </li>
              );
            })}
          </ol>
        </header>

        {done ? (
          <section className="ae-chk-success">
            <MdCheck size={36} aria-hidden />
            <h2>Commande confirmée</h2>
            <p>
              Un e-mail de confirmation vous sera adressé sous peu. Notre atelier
              prépare l’emballage et le certificat d’authenticité.
            </p>
            <div className="ae-chk-success-actions">
              <Link to="/home" className="ae-chk-btn ae-chk-btn-dark">
                Retour au catalogue
              </Link>
              <button
                type="button"
                className="ae-chk-btn ae-chk-btn-ghost"
                onClick={() => navigate('/dashboard')}
              >
                Voir mon espace
              </button>
            </div>
          </section>
        ) : (
          <div className="ae-chk-layout">
            <div className="ae-chk-main">
              <section className="ae-chk-card">
                <div className="ae-chk-card-head">
                  <span className="ae-chk-num">1</span>
                  <div>
                    <h2>Coordonnées &amp; Adresse de livraison</h2>
                    <p>Renseignez votre destination pour le calcul des délais d’expédition.</p>
                  </div>
                  <em className="ae-chk-badge">Étape active</em>
                </div>

                <p className="ae-chk-label">Adresses sauvegardées</p>
                <div className="ae-chk-addresses">
                  {CHECKOUT_ADDRESSES.map((a) => {
                    const Icon = ADDR_ICONS[a.icon] || MdHome;
                    return (
                      <label
                        key={a.id}
                        className={`ae-chk-address${addressId === a.id ? ' is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={addressId === a.id}
                          onChange={() => setAddressId(a.id)}
                        />
                        <span className="ae-chk-address-top">
                          <Icon size={18} className="ae-chk-address-icon" aria-hidden />
                          <strong>{a.label}</strong>
                          <span className="ae-chk-radio" aria-hidden />
                        </span>
                        <span className="ae-chk-address-body">
                          <span className="ae-chk-address-name">{a.name}</span>
                          {a.lines.map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                          <span className="ae-chk-address-phone">{a.phone}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="ae-chk-link"
                  onClick={() => flash('Formulaire nouvelle adresse bientôt disponible.')}
                >
                  <MdAddCircleOutline size={18} aria-hidden />
                  Utiliser une nouvelle adresse de livraison
                </button>
              </section>

              <section className="ae-chk-card">
                <div className="ae-chk-card-head">
                  <span className="ae-chk-num ae-chk-num-soft">2</span>
                  <div>
                    <h2>Mode d’expédition d’art &amp; mobilier</h2>
                    <p>
                      Tous nos colis sont scellés et protégés par un calage minéral recyclé.
                    </p>
                  </div>
                </div>

                <div className="ae-chk-ship">
                  {CHECKOUT_SHIPPING.map((s) => {
                    const NoteIcon = SHIP_ICONS[s.icon] || MdEco;
                    return (
                      <label
                        key={s.id}
                        className={`ae-chk-ship-opt${shippingId === s.id ? ' is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingId === s.id}
                          onChange={() => setShippingId(s.id)}
                        />
                        <span className="ae-chk-radio" aria-hidden />
                        <span className="ae-chk-ship-body">
                          <strong>
                            {s.title}
                            {s.badge ? (
                              <em className={`ae-chk-ship-badge is-${s.badgeTone || 'muted'}`}>
                                {s.badge}
                              </em>
                            ) : null}
                          </strong>
                          <span>{s.text}</span>
                          {s.note ? (
                            <span className="ae-chk-ship-note">
                              <NoteIcon size={14} aria-hidden />
                              {s.note}
                            </span>
                          ) : null}
                        </span>
                        <strong className="ae-chk-ship-price">{s.priceLabel}</strong>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="ae-chk-card">
                <div className="ae-chk-card-head">
                  <span className="ae-chk-num">3</span>
                  <div>
                    <h2>Paiement sécurisé crypté</h2>
                    <p>Protocole TLS 1.3 bancaire et authentification 3D-Secure.</p>
                  </div>
                  <em className="ae-chk-ssl">
                    <MdShield size={14} aria-hidden />
                    SSL 256 bits
                  </em>
                </div>

                <div className="ae-chk-pay-tabs" role="tablist">
                  {[
                    { id: 'card', label: 'Carte bancaire', Icon: MdCreditCard },
                    { id: 'apple', label: 'Apple Pay', Icon: FaApple },
                    { id: 'wire', label: 'Virement Instant', Icon: MdSwapHoriz },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={payTab === t.id}
                      className={`ae-chk-pay-tab${payTab === t.id ? ' is-active' : ''}`}
                      onClick={() => setPayTab(t.id)}
                    >
                      <t.Icon size={16} aria-hidden />
                      {t.label}
                    </button>
                  ))}
                </div>

                {payTab === 'card' ? (
                  <div className="ae-chk-pay-form">
                    <div className="ae-chk-field-head">
                      <span>Numéro de carte de paiement</span>
                      <span className="ae-chk-brands" aria-hidden>
                        Visa · Mastercard · Amex
                      </span>
                    </div>
                    <label className="ae-chk-sr-only" htmlFor="chk-card-number">
                      Numéro de carte
                    </label>
                    <div className="ae-chk-card-field">
                      <input
                        id="chk-card-number"
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                      />
                      <MdLock size={16} className="ae-chk-field-lock" aria-hidden />
                    </div>

                    <label>
                      Nom figurant sur la carte
                      <input
                        value={card.name}
                        onChange={(e) => setCard({ ...card, name: e.target.value })}
                      />
                    </label>
                    <div className="ae-chk-pay-row">
                      <label>
                        Expiration
                        <input
                          value={card.exp}
                          onChange={(e) => setCard({ ...card, exp: e.target.value })}
                        />
                      </label>
                      <label>
                        <span className="ae-chk-cvv-label">
                          CVV
                          <MdHelpOutline size={14} aria-hidden title="Code de sécurité" />
                        </span>
                        <input
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        />
                      </label>
                    </div>
                    <label className="ae-chk-check">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                      />
                      Enregistrer cette carte en toute sécurité pour mes futures acquisitions
                    </label>
                    <label className="ae-chk-check">
                      <input
                        type="checkbox"
                        checked={sameBilling}
                        onChange={(e) => setSameBilling(e.target.checked)}
                      />
                      L’adresse de facturation est identique à l’adresse de livraison
                    </label>
                  </div>
                ) : (
                  <div className="ae-chk-pay-alt">
                    <p>
                      {payTab === 'apple'
                        ? 'Confirmez le paiement via Apple Pay sur l’étape suivante.'
                        : 'Un IBAN sécurisé vous sera communiqué après validation.'}
                    </p>
                  </div>
                )}

                <ul className="ae-chk-trust">
                  <li>
                    <MdLock size={16} aria-hidden />
                    Cryptage 256 bits
                  </li>
                  <li>
                    <MdShield size={16} aria-hidden />
                    Garantie anti-fraude
                  </li>
                  <li>
                    <MdVerifiedUser size={16} aria-hidden />
                    3D Secure v2.2
                  </li>
                </ul>
              </section>
            </div>

            <aside className="ae-chk-aside">
              <div className="ae-chk-summary">
                <div className="ae-chk-summary-head">
                  <h2>
                    <MdShoppingBag size={18} aria-hidden />
                    Votre panier ({items.length} article{items.length > 1 ? 's' : ''})
                  </h2>
                  <button
                    type="button"
                    className="ae-chk-edit"
                    onClick={() => navigate('/home')}
                  >
                    Modifier
                  </button>
                </div>

                <ul className="ae-chk-items">
                  {items.map((item) => {
                    const id = itemId(item);
                    return (
                      <li key={id}>
                        <img src={itemImage(item)} alt="" />
                        <div className="ae-chk-item-info">
                          <strong>{itemName(item)}</strong>
                          <span>{itemDetail(item)}</span>
                          <div className="ae-chk-item-actions">
                            <div className="ae-chk-qty">
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
                              className="ae-chk-remove"
                              onClick={() => removeItem(id)}
                            >
                              <MdDeleteOutline size={14} aria-hidden />
                              Supprimer
                            </button>
                          </div>
                        </div>
                        <em className="ae-chk-item-price">
                          {formatEuro(Number(item.price) * item.quantity)}
                        </em>
                      </li>
                    );
                  })}
                </ul>

                <div className="ae-chk-promo-row">
                  <label className="ae-chk-promo-field">
                    <MdLocalOffer size={16} aria-hidden />
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      aria-label="Code promo"
                    />
                  </label>
                  <button type="button" className="ae-chk-promo-btn" onClick={applyPromo}>
                    Appliquer
                  </button>
                </div>
                {promoApplied ? (
                  <p className="ae-chk-promo-ok">
                    <MdCheck size={14} aria-hidden />
                    Code EPUREVIP appliqué : frais de port offerts et traitement prioritaire
                  </p>
                ) : null}

                <dl className="ae-chk-totals">
                  <div>
                    <dt>Sous-total articles (HT)</dt>
                    <dd>{formatEuro(ht)}</dd>
                  </div>
                  <div>
                    <dt>TVA légale (20%)</dt>
                    <dd>{formatEuro(tva)}</dd>
                  </div>
                  <div>
                    <dt>
                      Livraison estimée (
                      {shippingId === 'express' ? 'Express' : 'Éco-responsable'})
                    </dt>
                    <dd>
                      {effectiveShipping === 0 ? 'Offerte' : formatEuro(effectiveShipping)}
                    </dd>
                  </div>
                  <div>
                    <dt>Remise Studio Privilège</dt>
                    <dd>− 0,00 €</dd>
                  </div>
                  <div className="ae-chk-total">
                    <dt>Total TTC</dt>
                    <dd>{formatEuro(totalTtc)}</dd>
                  </div>
                </dl>
                <p className="ae-chk-currency">Devise : EUR (€) · Taxes incluses</p>

                <button
                  type="button"
                  className="ae-chk-btn ae-chk-btn-dark ae-chk-pay-cta"
                  disabled={busy || !items.length}
                  onClick={handlePay}
                >
                  <MdLock size={16} aria-hidden />
                  {busy ? 'Traitement…' : `Confirmer et payer ${formatEuro(totalTtc)}`}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
