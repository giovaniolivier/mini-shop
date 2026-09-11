export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}
