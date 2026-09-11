import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as cartApi from '../../services/cartApi';
import { createOrder } from '../../services/ordersApi';

const DELIVERY_OPTIONS = [
  { label: 'Standard (5€)', value: 'standard', price: 5 },
  { label: 'Express (10€)', value: 'express', price: 10 },
  { label: 'Retrait magasin (gratuit)', value: 'pickup', price: 0 },
];
const PAYMENT_OPTIONS = [
  { label: 'Carte bancaire', value: 'card' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Paiement à la livraison', value: 'cod' },
];

function applyCart(res) {
  return {
    items: res.data.items || [],
    total: res.data.total || 0,
  };
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
        else alert('Erreur modification quantité : ' + (err.response?.data?.message || err.message));
      });
  };

  const subQty = (id) => {
    const current = cartState.items.find((i) => i.ProductId === id)?.quantity || 1;
    cartApi
      .updateCartItem(id, Math.max(1, current - 1))
      .then((res) => setCartState(applyCart(res)))
      .catch((err) => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') reloadCartOnMissing();
        else alert('Erreur modification quantité : ' + (err.response?.data?.message || err.message));
      });
  };

  const removeItem = (id) => {
    cartApi
      .removeFromCart(id)
      .then((res) => setCartState(applyCart(res)))
      .catch((err) => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') reloadCartOnMissing();
        else alert('Erreur suppression du panier : ' + (err.response?.data?.message || err.message));
      });
  };

  const handleConfirm = async () => {
    try {
      await createOrder(
        cartState.items.map((item) => ({
          productId: item.ProductId || item.productId || (item.Product ? item.Product.id : undefined),
          quantity: item.quantity,
        }))
      );
      await cartApi.clearCart();
      setCartState({ items: [], total: 0 });
      alert('🎉 Merci pour votre commande !\nVotre achat a bien été pris en compte.\nVous recevrez un email de confirmation sous peu.\nÀ très bientôt sur MiniShop !');
      navigate('/dashboard');
    } catch (err) {
      alert('Erreur lors de la validation de la commande : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleNextStep = (nextStep) => {
    if (cartState.items.length === 0) {
      alert('🛒 Votre panier est vide !\nAjoutez des produits avant de poursuivre votre commande.');
      return;
    }
    setStep(nextStep);
  };

  const filteredItems = (cartState.items || []).filter((item) => item.Product);
  const subtotal = filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = DELIVERY_OPTIONS.find((opt) => opt.value === delivery)?.price || 0;
  const taxes = Math.round(subtotal * 0.2 * 100) / 100;
  const total = subtotal + deliveryPrice + taxes;

  const section = { background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 18, padding: '12px 36px', fontSize: 18, fontWeight: 800, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0' };
  const btnSec = { ...btn, background: '#eee', color: '#222', boxShadow: 'none' };
  const stepBadge = (active) => ({ display: 'inline-block', minWidth: 36, height: 36, lineHeight: '36px', borderRadius: '50%', background: active ? 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)' : '#e3f2fd', color: active ? '#fff' : '#1976d2', fontWeight: 800, fontSize: 18, textAlign: 'center', marginRight: 12, boxShadow: active ? '0 2px 8px #e0e0e0' : 'none' });
  const stepTitle = (active) => ({ color: active ? '#1976d2' : '#888', fontWeight: 800, fontSize: 18, marginRight: 24 });

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 800, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Finaliser ma commande</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 36, gap: 18 }}>
        <span style={stepBadge(step === 1)}>1</span><span style={stepTitle(step === 1)}>Panier</span>
        <span style={{ fontSize: 22, color: '#bbb' }}>→</span>
        <span style={stepBadge(step === 2)}>2</span><span style={stepTitle(step === 2)}>Livraison</span>
        <span style={{ fontSize: 22, color: '#bbb' }}>→</span>
        <span style={stepBadge(step === 3)}>3</span><span style={stepTitle(step === 3)}>Paiement</span>
        <span style={{ fontSize: 22, color: '#bbb' }}>→</span>
        <span style={stepBadge(step === 4)}>4</span><span style={stepTitle(step === 4)}>Récapitulatif</span>
      </div>
      {step === 1 && (
        <section style={section}>
          <h2 style={{ fontSize: 24, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Mon panier</h2>
          {filteredItems.length === 0 ? <p style={{ color: '#888', fontSize: 18 }}>Votre panier est vide.</p> : (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {filteredItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                  <img src={item.Product?.image_url || item.image_url} alt={item.Product?.name || item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, boxShadow: '0 1px 6px #e0e0e0' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 17 }}>{item.Product?.name || item.name}</div>
                    <div style={{ color: '#555', fontSize: 15 }}>{item.price} € x {item.quantity}</div>
                    <div style={{ color: '#888', fontSize: 14 }}>Total : {(item.price * item.quantity).toFixed(2)} €</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button onClick={() => addQty(item.ProductId)} style={{ background: '#e3f2fd', border: 'none', borderRadius: 8, fontWeight: 700, color: '#1976d2', fontSize: 18, padding: '2px 8px', cursor: 'pointer' }}>+</button>
                    <button onClick={() => subQty(item.ProductId)} style={{ background: '#e3f2fd', border: 'none', borderRadius: 8, fontWeight: 700, color: '#1976d2', fontSize: 18, padding: '2px 8px', cursor: 'pointer' }}>-</button>
                    <button onClick={() => removeItem(item.ProductId)} style={{ background: '#ffe0e0', border: 'none', borderRadius: 8, fontWeight: 700, color: '#e53935', fontSize: 15, padding: '2px 8px', cursor: 'pointer' }}>Suppr.</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button style={btn} onClick={() => handleNextStep(2)} disabled={cartState.items.length === 0}>Suivant</button>
          </div>
        </section>
      )}
      {step === 2 && (
        <section style={section}>
          <h2 style={{ fontSize: 24, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Mode de livraison</h2>
          {DELIVERY_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: 'block', margin: '16px 0', fontSize: 18 }}>
              <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={(e) => setDelivery(e.target.value)} /> {opt.label}
            </label>
          ))}
          <div style={{ marginTop: 32, textAlign: 'right' }}>
            <button style={btnSec} onClick={() => setStep(1)}>Précédent</button>
            <button style={btn} onClick={() => setStep(3)}>Suivant</button>
          </div>
        </section>
      )}
      {step === 3 && (
        <section style={section}>
          <h2 style={{ fontSize: 24, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Mode de paiement</h2>
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: 'block', margin: '16px 0', fontSize: 18 }}>
              <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={(e) => setPayment(e.target.value)} /> {opt.label}
            </label>
          ))}
          <div style={{ marginTop: 32, textAlign: 'right' }}>
            <button style={btnSec} onClick={() => setStep(2)}>Précédent</button>
            <button style={btn} onClick={() => setStep(4)}>Suivant</button>
          </div>
        </section>
      )}
      {step === 4 && (
        <section style={section}>
          <h2 style={{ fontSize: 24, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Récapitulatif</h2>
          <ul style={{ marginBottom: 18 }}>
            {filteredItems.map((item) => (
              <li key={item.id} style={{ fontSize: 17, margin: '8px 0' }}>{item.Product?.name || item.name} x {item.quantity} = {(item.price * item.quantity).toFixed(2)} €</li>
            ))}
          </ul>
          <div style={{ margin: '18px 0', fontSize: 18 }}>
            <div>Sous-total : <b>{subtotal.toFixed(2)} €</b></div>
            <div>Frais de livraison : <b>{deliveryPrice.toFixed(2)} €</b></div>
            <div>Taxes (20%) : <b>{taxes.toFixed(2)} €</b></div>
            <div style={{ fontSize: 22, color: '#1976d2', marginTop: 8 }}>Total à payer : <b>{total.toFixed(2)} €</b></div>
            <div style={{ marginTop: 12 }}>Livraison : <b>{DELIVERY_OPTIONS.find((opt) => opt.value === delivery)?.label}</b></div>
            <div>Paiement : <b>{PAYMENT_OPTIONS.find((opt) => opt.value === payment)?.label}</b></div>
          </div>
          <div style={{ marginTop: 32, textAlign: 'right' }}>
            <button style={btnSec} onClick={() => setStep(3)}>Précédent</button>
            <button style={btn} onClick={handleConfirm}>Valider la commande</button>
          </div>
        </section>
      )}
    </div>
  );
}
