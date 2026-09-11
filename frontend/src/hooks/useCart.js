import { useState, useEffect, useCallback } from 'react';
import * as cartApi from '../services/cartApi';

function normalizeCart(data) {
  const items = (data?.items || []).filter((item) => item.Product);
  return {
    items,
    total: data?.total || 0,
  };
}

export default function useCart() {
  const [cartState, setCartState] = useState({ items: [], total: 0 });
  const [cartOpen, setCartOpen] = useState(false);

  const refreshCart = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve();
    return cartApi
      .getCart()
      .then((res) => setCartState(normalizeCart(res.data)))
      .catch((err) => console.error('Erreur chargement panier', err));
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = (product) => {
    cartApi
      .addToCart(product.id, 1)
      .then((res) => setCartState(normalizeCart(res.data)))
      .catch((err) =>
        alert('Erreur ajout au panier : ' + (err.response?.data?.message || err.message))
      );
  };

  const removeFromCart = (productId) => {
    cartApi
      .removeFromCart(productId)
      .then((res) => setCartState(normalizeCart(res.data)))
      .catch((err) =>
        alert('Erreur suppression du panier : ' + (err.response?.data?.message || err.message))
      );
  };

  const updateCartItem = (productId, quantity) => {
    if (!productId || !quantity) {
      alert('Erreur : identifiant produit ou quantité manquant');
      return;
    }
    cartApi
      .updateCartItem(productId, quantity)
      .then((res) => setCartState(normalizeCart(res.data)))
      .catch((err) => {
        if (err.response?.data?.message === 'Produit non présent dans le panier') {
          refreshCart();
          alert("Ce produit n'est plus dans votre panier. Le panier a été rechargé.");
        } else {
          alert('Erreur modification quantité : ' + (err.response?.data?.message || err.message));
        }
      });
  };

  const handleOpenCart = () => {
    refreshCart().then(() => setCartOpen(true));
  };

  const cart = cartState.items;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cart,
    cartState,
    setCartState,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItem,
    handleOpenCart,
    refreshCart,
  };
}
