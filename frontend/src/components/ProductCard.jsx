import { MdFavoriteBorder, MdNorthEast } from 'react-icons/md';

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`;
}

function stars(rating) {
  const full = Math.round(Number(rating) || 0);
  return '★★★★★'.slice(0, Math.min(5, full)) + '☆☆☆☆☆'.slice(0, Math.max(0, 5 - full));
}

export default function ProductCard({ product, onOpen, onWish }) {
  const inStock = (product.stock ?? 0) > 0;
  const status = inStock
    ? 'En stock'
    : `Sur commande (${product.leadWeeks || 2} sem.)`;

  return (
    <article
      className="ae-shop-card"
      onClick={() => onOpen?.(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen?.(product);
      }}
    >
      <div className="ae-shop-card-media">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#ebe9e4' }} />
        )}
        {product.badge && (
          <span
            className={`ae-shop-card-badge${
              product.badge === 'NOUVEAU' ? ' ae-shop-card-badge--new' : ''
            }`}
          >
            {product.badge}
          </span>
        )}
        <button
          type="button"
          className="ae-shop-wish"
          aria-label="Favoris"
          onClick={(e) => {
            e.stopPropagation();
            onWish?.(product);
          }}
        >
          <MdFavoriteBorder size={18} />
        </button>
      </div>
      <div className="ae-shop-card-body">
        <p className="ae-shop-card-cat">{product.category || 'Création'}</p>
        <h3>{product.name}</h3>
        {(product.rating || product.reviews) && (
          <div className="ae-shop-rating">
            <span className="stars" aria-hidden>
              {stars(product.rating || 5)}
            </span>
            <span>
              {(product.rating || 5).toFixed(1)} ({product.reviews || 0})
            </span>
          </div>
        )}
        {product.description && <p className="ae-shop-card-desc">{product.description}</p>}
        <div className="ae-shop-card-foot">
          <div>
            <div className="ae-shop-card-price">{formatEuro(product.price)}</div>
            <div className={`ae-shop-stock ${inStock ? 'ok' : 'wait'}`}>• {status}</div>
          </div>
          <button
            type="button"
            className="ae-shop-go"
            aria-label="Voir le produit"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(product);
            }}
          >
            <MdNorthEast size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
