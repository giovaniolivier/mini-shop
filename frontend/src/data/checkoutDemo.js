/** Checkout — maquette Paiement & Expédition */

export const CHECKOUT_ADDRESSES = [
  {
    id: 'marais',
    label: 'Atelier Marais (Par défaut)',
    name: 'Alexandre de Saint-Germain',
    lines: ['14 Rue de Turenne', '75004 Paris, France'],
    phone: '+33 6 82 45 19 03',
    icon: 'home',
    default: true,
  },
  {
    id: 'cabinet',
    label: 'Cabinet Saint-Germain',
    name: 'Studio Épure Architecture',
    lines: ['42 Boulevard Raspail', '75007 Paris, France'],
    phone: '+33 1 44 20 89 00',
    icon: 'business',
    default: false,
  },
];

export const CHECKOUT_SHIPPING = [
  {
    id: 'standard',
    title: 'Livraison Standard Éco-responsable',
    text: 'Délai estimé : 2 à 4 jours ouvrés. Neutralité carbone certifiée.',
    note: 'Emballage kraft neutre & transport vert',
    icon: 'eco',
    price: 0,
    priceLabel: '0,00 €',
    badge: 'Offerte',
    badgeTone: 'accent',
  },
  {
    id: 'express',
    title: 'Express Sécurisé 24h & Remise en main propre',
    text: 'Livraison garantie demain avant 13h via coursier spécialisé.',
    note: 'Créneau horaire 2h & code OTP de réception',
    icon: 'bolt',
    price: 15,
    priceLabel: '+15,00 €',
    badge: 'Prioritaire',
    badgeTone: 'muted',
  },
  {
    id: 'pickup',
    title: 'Retrait Studio & Atelier Paris',
    text: 'Disponible dès 14h aujourd’hui au 28 Rue Jacob, 75006 Paris.',
    note: 'Présentation privée des pièces et échange avec l’artisan',
    icon: 'store',
    price: 0,
    priceLabel: 'Gratuit',
    badge: 'Gratuit',
    badgeTone: 'muted',
  },
];

export const CHECKOUT_DEMO_ITEMS = [
  {
    id: 'chk-1',
    ProductId: 'chk-1',
    quantity: 1,
    price: 480,
    name: "Vase Minéral Brut 'Stella'",
    detail: 'Finition Craie Naturelle • Série numérotée',
    image_url:
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=200&h=200&fit=crop',
    Product: {
      id: 'chk-1',
      name: "Vase Minéral Brut 'Stella'",
      image_url:
        'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=200&h=200&fit=crop',
    },
    _demo: true,
  },
  {
    id: 'chk-2',
    ProductId: 'chk-2',
    quantity: 1,
    price: 360,
    name: 'Lampe Balancier Laiton',
    detail: 'Laiton brossé & Marbre de Carrare',
    image_url:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&h=200&fit=crop',
    Product: {
      id: 'chk-2',
      name: 'Lampe Balancier Laiton',
      image_url:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&h=200&fit=crop',
    },
    _demo: true,
  },
];
