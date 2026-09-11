import logo from '../assets/logo.png';

/**
 * Logo Épure Studio (PNG).
 * @param {'auth'|'header'|'sidebar'} variant
 */
export default function BrandLogo({ variant = 'auth', alt = 'Épure Studio' }) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`ae-brand-logo ae-brand-logo--${variant}`}
      draggable={false}
    />
  );
}
