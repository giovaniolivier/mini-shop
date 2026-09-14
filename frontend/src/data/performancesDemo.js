/** Démo — Performances & Métriques Opérationnelles */

export const DEMO_PERF_KPI = {
  caNet: 142850,
  caDelta: 12.4,
  conversion: 3.82,
  conversionDelta: 0.4,
  avgCart: 1840,
  avgCartDelta: 6.2,
  uxScore: 98,
  uxLabel: 'Excellent',
};

export const DEMO_PERF_GROWTH = [
  { week: 'S1', ventes: 18200, commandes: 98 },
  { week: 'S2', ventes: 21400, commandes: 112 },
  { week: 'S3', ventes: 19850, commandes: 105 },
  { week: 'S4', ventes: 24100, commandes: 128 },
  { week: 'S5', ventes: 26800, commandes: 141 },
  { week: 'S6', ventes: 25500, commandes: 134 },
  { week: 'S7', ventes: 31200, commandes: 162 },
  { week: 'S8', ventes: 28900, commandes: 148 },
];

export const DEMO_PERF_FUNNEL = [
  { label: 'Visiteurs du Catalogue', value: 65200, pct: 100 },
  { label: 'Fiches Produit Consultées', value: 28400, pct: 43.6 },
  { label: 'Ajouts au Panier', value: 6200, pct: 9.5 },
  { label: 'Checkouts Initiés', value: 3100, pct: 4.8 },
  { label: 'Paiements & Mise en Rayonnage', value: 1840, pct: 2.8 },
];

export const DEMO_PERF_FAMILIES = [
  {
    name: 'Mobilier Ébénisterie',
    volume: 118,
    caShare: 42,
    margin: 62,
    returns: 1.2,
    shareBar: 42,
  },
  {
    name: 'Textile Mural Soie & Chêne',
    volume: 86,
    caShare: 18,
    margin: 71,
    returns: 0.8,
    shareBar: 18,
  },
  {
    name: 'Luminaires Albâtre & Laiton',
    volume: 142,
    caShare: 28,
    margin: 58,
    returns: 2.1,
    shareBar: 28,
  },
  {
    name: 'Objets d’Art & Céramiques Brutes',
    volume: 204,
    caShare: 12,
    margin: 74,
    returns: 0.4,
    shareBar: 12,
  },
];

export const DEMO_PERF_OPS = {
  leadTimeDays: 18,
  nps: 89,
  sla: 99.98,
};
