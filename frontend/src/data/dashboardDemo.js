/** Données mock — Tableau de bord exécutif (maquette) */
export const DEMO_DASH_KPI = {
  revenue: 124580,
  orders: 1428,
  avgCart: 87.2,
  conversion: 3.42,
  deltaRevenue: 14.2,
  deltaOrders: 8.7,
  deltaAvg: 4.1,
  deltaConversion: 0.6,
  uniqueClients: 384,
};

export const DEMO_MONTHLY = [
  { month: '2025-05', revenue: 18200 },
  { month: '2025-06', revenue: 22100 },
  { month: '2025-07', revenue: 19850 },
  { month: '2025-08', revenue: 25400 },
  { month: '2025-09', revenue: 28900 },
  { month: '2025-10', revenue: 38420 },
  { month: '2025-11', revenue: 31200 },
  { month: '2025-12', revenue: 35600 },
];

export const DEMO_CATEGORIES = [
  { category: 'Mobilier Architectonique', amount: 52320, percent: 42 },
  { category: 'Luminaires & Suspensions', amount: 34880, percent: 28 },
  { category: 'Objets & Céramique', amount: 22420, percent: 18 },
  { category: 'Textiles Laine & Lin', amount: 14960, percent: 12 },
];

export const DEMO_BESTSELLER = {
  name: 'Fauteuil Travertin 02',
  quantity: 118,
};

export const DEMO_LOW_STOCK = [
  {
    id: 'd1',
    name: 'Chaise Noyer Massif — V.01',
    stock: 2,
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=80&h=80&fit=crop',
  },
  {
    id: 'd2',
    name: 'Suspension Halo Laiton',
    stock: 3,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&h=80&fit=crop',
  },
  {
    id: 'd3',
    name: 'Vase Sculpté Grès Noir',
    stock: 0,
    image_url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=80&h=80&fit=crop',
  },
];

export const DEMO_ORDERS = [
  {
    id: 8902,
    client: 'Maison Sarah L.',
    total: 2960,
    status: 'Payée',
    date: new Date(Date.now() - 14 * 60000).toISOString(),
  },
  {
    id: 8901,
    client: 'Atelier Nord & Cie',
    total: 1240,
    status: 'En préparation',
    date: new Date(Date.now() - 42 * 60000).toISOString(),
  },
  {
    id: 8898,
    client: 'Galerie Rivoli',
    total: 2150,
    status: 'Expédiée',
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 8894,
    client: 'Résidence Montmirail',
    total: 4820,
    status: 'Payée',
    date: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 8887,
    client: 'Studio Linden',
    total: 980,
    status: 'En préparation',
    date: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
];

export const DEMO_SPARK = [18200, 22100, 19850, 25400, 28900, 38420];
