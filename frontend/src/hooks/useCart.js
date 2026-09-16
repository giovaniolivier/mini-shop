import { useState, useEffect, useCallback } from 'react';
import * as cartApi from '../services/cartApi';

function isDemoProduct(productOrId) {
  if (productOrId == null) return false;
  if (typeof productOrId === 'object') {
    return Boolean(productOrId._demo) || String(productOrId.id || '').startsWith('shop-');
  }
  return String(productOrId).startsWith('shop-');
}

function normalizeCart(data) {
  const items = (data?.items || []).filter((item) => item.Product);
  return {
    items,
    total: data?.total || 0,
  };
}

function calcTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 0), 0);
}

function mergeDemoItems(apiItems, prevItems) {
  const demo = (prevItems || []).filter(
    (i) => i._demo || isDemoProduct(i.ProductId || i.productId || i.id)
  );
  return [...apiItems, ...demo];
}

export default function useCart() {
  const [cartState, setCartState] = useState({ items: [], total: 0 });
  const [cartOpen, setCartOpen] = useState(false);

  const refreshCart = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve();
    return cartApi
      .getCart()
      .then((res) => {
        const api = normalizeCart(res.data);
        setCartState((prev) => {
          const items = mergeDemoItems(api.items, prev.items);
          return { items, total: calcTotal(items) };
        });
      })
      .catch((err) => console.error('Erreur chargement panier', err));
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = (product) => {
    if (isDemoProduct(product)) {
      setCartState((prev) => {
        const items = [...prev.items];
        const idx = items.findIndex(
          (i) => (i.ProductId || i.productId || i.id) === product.id
        );
        if (idx >= 0) {
          items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
        } else {
          items.push({
            id: product.id,
            ProductId: product.id,
            productId: product.id,
            quantity: 1,
            price: product.price,
            name: product.name,
            image_url: product.image_url,
            Product: product,
            _demo: true,
          });
        }
        return { items, total: calcTotal(items) };
      });
      return;
    }

    cartApi
      .addToCart(product.id, 1)
      .then((res) => {
        const api = normalizeCart(res.data);
        setCartState((prev) => {
          const items = mergeDemoItems(api.items, prev.items);
          return { items, total: calcTotal(items) };
        });
      })
      .catch((err) =>
        alert('Erreur ajout au panier : ' + (err.response?.data?.message || err.message))
      );
  };

  const removeFromCart = (productId) => {
    if (isDemoProduct(productId)) {
      setCartState((prev) => {
        const items = prev.items.filter(
          (i) => (i.ProductId || i.productId || i.id) !== productId
        );
        return { items, total: calcTotal(items) };
      });
      return;
    }

    cartApi
      .removeFromCart(productId)
      .then((res) => {
        const api = normalizeCart(res.data);
        setCartState((prev) => {
          const items = mergeDemoItems(api.items, prev.items);
          return { items, total: calcTotal(items) };
        });
      })
      .catch((err) =>
        alert('Erreur suppression du panier : ' + (err.response?.data?.message || err.message))
      );
  };

  const updateCartItem = (productId, quantity) => {
    if (!productId || !quantity) {
      alert('Erreur : identifiant produit ou quantité manquant');
      return;
    }

    if (isDemoProduct(productId)) {
      setCartState((prev) => {
        const items = prev.items.map((i) =>
          (i.ProductId || i.productId || i.id) === productId ? { ...i, quantity } : i
        );
        return { items, total: calcTotal(items) };
      });
      return;
    }

    cartApi
      .updateCartItem(productId, quantity)
      .then((res) => {
        const api = normalizeCart(res.data);
        setCartState((prev) => {
          const items = mergeDemoItems(api.items, prev.items);
          return { items, total: calcTotal(items) };
        });
      })
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
