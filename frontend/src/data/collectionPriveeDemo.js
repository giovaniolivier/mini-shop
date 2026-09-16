/** Collection Privée — maquette espace prescripteur */

export const PRIVATE_PROJECTS = [
  { id: 'all', label: 'Toutes les pièces', count: 4 },
  { id: 'marais', label: 'Projet Appartement Marais', count: 2 },
  { id: 'capferret', label: 'Projet Villa Cap Ferret', count: 2 },
  { id: 'editions', label: 'Éditions numérotées', count: 1 },
];

export const PRIVATE_COLLECTION = [
  {
    id: 'priv-1',
    name: 'Table Monolithe Chêne Fumé & Acier Brut',
    price: 8420,
    projectId: 'marais',
    projectLabel: 'Appartement Marais',
    tags: [
      { label: 'Projet Marais', tone: 'ghost' },
      { label: 'Chêne fumé', tone: 'ghost' },
    ],
    status: 'stock',
    statusText: 'En stock • Livraison gant blanc sous 5 jours',
    action: 'cart',
    image_url:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&h=1100&fit=crop',
  },
  {
    id: 'priv-2',
    name: 'Fauteuil Solstice Travertin Édition',
    price: 2890,
    projectId: 'marais',
    projectLabel: 'Appartement Marais',
    tags: [
      { label: 'Édition limitée 12/30', tone: 'gold' },
      { label: 'Projet Marais', tone: 'ghost' },
    ],
    status: 'limited',
    statusText: 'Plus que 2 exemplaires numérotés',
    action: 'cart',
    edition: true,
    image_url:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&h=1100&fit=crop',
  },
  {
    id: 'priv-3',
    name: 'Lampe Bureau Orbite Laiton Massif',
    price: 1940,
    projectId: 'capferret',
    projectLabel: 'Villa Cap Ferret',
    tags: [
      { label: 'Villa Cap Ferret', tone: 'ghost' },
      { label: 'Laiton massif', tone: 'ghost' },
    ],
    status: 'atelier',
    statusText: 'Disponible immédiatement en atelier Paris',
    action: 'cart',
    image_url:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&h=1100&fit=crop',
  },
  {
    id: 'priv-4',
    name: 'Vase Sculptural Terre Chamottée',
    price: 1600,
    projectId: 'capferret',
    projectLabel: 'Villa Cap Ferret',
    tags: [
      { label: 'Villa Cap Ferret', tone: 'ghost' },
      { label: 'Terre chamottée', tone: 'ghost' },
    ],
    status: 'order',
    statusText: 'Façonné sur commande (Délai 2 sem.)',
    action: 'sample',
    image_url:
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900&h=1100&fit=crop',
  },
];

export const PRIVATE_STATS = {
  selection: 4,
  partages: 1,
  estimation: 14850,
};
