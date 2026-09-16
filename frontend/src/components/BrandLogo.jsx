import logo from '../assets/logo.png';

/**
 * Logo Épure Studio.
 * @param {'auth'|'header'|'sidebar'|'shop'|'mark'} variant
 */
export default function BrandLogo({ variant = 'auth', alt = 'Épure Studio' }) {
  if (variant === 'shop' || variant === 'mark') {
    return (
      <span className={`ae-brand-mark ae-brand-mark--${variant}`} aria-label={alt}>
        <span className="ae-brand-mark-icon" aria-hidden>
          A
        </span>
        {variant === 'shop' && (
          <span className="ae-brand-mark-text">
            <b>Épure</b> Studio
          </span>
        )}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={alt}
      className={`ae-brand-logo ae-brand-logo--${variant}`}
      draggable={false}
    />
  );
}
