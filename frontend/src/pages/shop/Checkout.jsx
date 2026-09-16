import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as cartApi from '../../services/cartApi';
import { createOrder } from '../../services/ordersApi';

const DELIVERY_OPTIONS = [
  { label: 'Standard (5 €)', value: 'standard', price: 5 },
  { label: 'Express (10 €)', value: 'express', price: 10 },
  { label: 'Retrait atelier (gratuit)', value: 'pickup', price: 0 },
];
const PAYMENT_OPTIONS = [
  { label: 'Carte bancaire', value: 'card' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Paiement à la livraison', value: 'cod' },
];

function applyCart(res) {
  return { items: res.data.items || [], total: res.data.total || 0 };
}

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [cartState, setCartState] = useState({ items: [], total: 0 });

  useEffect(() => {
    cartApi
      .getCart()
      .then((res) => setCartState(applyCart(res)))
      .catch((err) => alert('Erreur chargement panier : ' + (err.response?.data?.message || err.message)));
  }, []);

  const reloadCartOnMissing = () => {
    alert("Ce produit n'est plus dans votre panier. Le panier va être rechargé.");
    cartApi.getCart().then((res) => setCartState(applyCart(res)));
  };

  const addQty = (id) => {
    cartApi
      .updateCartItem(id, (cartState.items.find((i) => i.ProductId === id)?.quantity || 0) + 1)
      .then((res) => setCartState(applyCart(res)))
      .catch((err) => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') reloadCartOnMissing();
        else alert(err.response?.data?.message || err.message);
      });
  };

  const subQty = (id) => {
    const current = cartState.items.find((i) => i.ProductId === id)?.quantity || 1;
    cartApi
      .updateCartItem(id, Math.max(1, current - 1))
      .then((res) => setCartState(applyCart(res)))
      .catch((err) => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') reloadCartOnMissing();
        else alert(err.response?.data?.message || err.message);
      });
  };

  const removeItem = (id) => {
    cartApi
      .removeFromCart(id)
      .then((res) => setCartState(applyCart(res)))
      .catch((err) => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') reloadCartOnMissing();
        else alert(err.response?.data?.message || err.message);
      });
  };

  const handleConfirm = async () => {
    try {
      await createOrder(
        cartState.items.map((item) => ({
          productId: item.ProductId || item.productId || item.Product?.id,
          quantity: item.quantity,
        }))
      );
      await cartApi.clearCart();
      setCartState({ items: [], total: 0 });
      alert('Merci pour votre commande Atelier Épure. Confirmation envoyée sous peu.');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleNextStep = (nextStep) => {
    if (cartState.items.length === 0) {
      alert('Votre panier est vide.');
      return;
    }
    setStep(nextStep);
  };

  const filteredItems = (cartState.items || []).filter((item) => item.Product);
  const subtotal = filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = DELIVERY_OPTIONS.find((opt) => opt.value === delivery)?.price || 0;
  const taxes = Math.round(subtotal * 0.2 * 100) / 100;
  const total = subtotal + deliveryPrice + taxes;

  const steps = ['Panier', 'Livraison', 'Paiement', 'Récap'];

  return (
    <div className="ae-page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="ae-page-title">Finaliser la commande</h1>
      <p className="ae-page-sub">Étape {step} sur 4 — Atelier Épure</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.75rem' }}>
        {steps.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: active ? 1 : 0.45,
                fontWeight: active ? 700 : 500,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active ? 'var(--color-primary)' : '#ebe9e4',
                  color: active ? '#fff' : 'var(--color-primary)',
                  fontSize: 13,
                }}
              >
                {n}
              </span>
              {label}
            </div>
          );
        })}
      </div>

      <section className="surface" style={{ padding: '1.5rem' }}>
        {step === 1 && (
          <>
            {filteredItems.length === 0 ? (
              <p style={{ color: 'var(--color-muted)' }}>Votre panier est vide.</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <img
                    src={item.Product?.image_url}
                    alt={item.Product?.name}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, background: '#ebe9e4' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.Product?.name}</div>
                    <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                      {item.price} € × {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => addQty(item.ProductId)}>
                      +
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => subQty(item.ProductId)}>
                      −
                    </button>
                    <button type="button" className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => removeItem(item.ProductId)}>
                      Suppr.
                    </button>
                  </div>
                </div>
              ))
            )}
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button type="button" className="btn btn-primary" disabled={cartState.items.length === 0} onClick={() => handleNextStep(2)}>
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {DELIVERY_OPTIONS.map((opt) => (
              <label key={opt.value} style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0', fontSize: 16 }}>
                <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={(e) => setDelivery(e.target.value)} />
                {opt.label}
              </label>
            ))}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Précédent
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {PAYMENT_OPTIONS.map((opt) => (
              <label key={opt.value} style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0', fontSize: 16 }}>
                <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={(e) => setPayment(e.target.value)} />
                {opt.label}
              </label>
            ))}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                Précédent
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(4)}>
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <ul style={{ paddingLeft: 18, marginBottom: 16 }}>
              {filteredItems.map((item) => (
                <li key={item.id} style={{ margin: '6px 0' }}>
                  {item.Product?.name} × {item.quantity} — {(item.price * item.quantity).toFixed(2)} €
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 15, lineHeight: 1.7 }}>
              <div>Sous-total : <b>{subtotal.toFixed(2)} €</b></div>
              <div>Livraison : <b>{deliveryPrice.toFixed(2)} €</b></div>
              <div>Taxes (20 %) : <b>{taxes.toFixed(2)} €</b></div>
              <div style={{ fontSize: 18, marginTop: 8, color: 'var(--color-secondary)' }}>
                Total : <b>{total.toFixed(2)} €</b>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(3)}>
                Précédent
              </button>
              <button type="button" className="btn btn-accent" onClick={handleConfirm}>
                Valider la commande
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
