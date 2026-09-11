import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdLock, MdCheckCircle } from 'react-icons/md';
import { FaApple } from 'react-icons/fa';
import { register } from '../../services/authApi';
import GoogleLogo from '../../components/GoogleLogo';
import BrandLogo from '../../components/BrandLogo';
import '../../styles/auth.css';

function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

function passwordLabel(score) {
  if (score <= 1) return 'Faible (12 car., symbole, chiffre)';
  if (score === 2) return 'Moyen (12 car., symbole, chiffre)';
  if (score === 3) return 'Exigeant (12 car., symbole, chiffre)';
  return 'Renforcé (12 car., symbole, chiffre)';
}

const COUNTRY_CODES = [
  { code: 'FR', dial: '+33', label: 'France', placeholder: '6 12 34 56 78' },
  { code: 'BE', dial: '+32', label: 'Belgique', placeholder: '470 12 34 56' },
  { code: 'CH', dial: '+41', label: 'Suisse', placeholder: '79 123 45 67' },
  { code: 'LU', dial: '+352', label: 'Luxembourg', placeholder: '621 123 456' },
  { code: 'CA', dial: '+1', label: 'Canada', placeholder: '514 555 0123' },
  { code: 'US', dial: '+1', label: 'États-Unis', placeholder: '202 555 0123' },
  { code: 'GB', dial: '+44', label: 'Royaume-Uni', placeholder: '7700 900123' },
  { code: 'DE', dial: '+49', label: 'Allemagne', placeholder: '151 12345678' },
  { code: 'ES', dial: '+34', label: 'Espagne', placeholder: '612 34 56 78' },
  { code: 'IT', dial: '+39', label: 'Italie', placeholder: '312 345 6789' },
  { code: 'PT', dial: '+351', label: 'Portugal', placeholder: '912 345 678' },
  { code: 'MA', dial: '+212', label: 'Maroc', placeholder: '612 34 56 78' },
  { code: 'SN', dial: '+221', label: 'Sénégal', placeholder: '77 123 45 67' },
  { code: 'CI', dial: '+225', label: 'Côte d’Ivoire', placeholder: '07 12 34 56 78' },
  { code: 'CM', dial: '+237', label: 'Cameroun', placeholder: '6 12 34 56 78' },
  { code: 'MG', dial: '+261', label: 'Madagascar', placeholder: '32 12 345 67' },
  { code: 'RE', dial: '+262', label: 'La Réunion', placeholder: '692 12 34 56' },
  { code: 'GP', dial: '+590', label: 'Guadeloupe', placeholder: '690 12 34 56' },
  { code: 'MQ', dial: '+596', label: 'Martinique', placeholder: '696 12 34 56' },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: 'FR',
    phone: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
    sampleKit: true,
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const score = useMemo(() => passwordScore(formData.password), [formData.password]);
  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((c) => c.code === formData.countryCode) || COUNTRY_CODES[0],
    [formData.countryCode]
  );

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const ssoSoon = (provider) => {
    setError(`Connexion ${provider} : bientôt disponible (OAuth à configurer).`);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptTerms) {
      setError('Veuillez accepter les Conditions Générales et la Politique de Confidentialité.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 12 || !/\d/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password)) {
      setError('Mot de passe : 12 caractères minimum, avec au moins un chiffre et un symbole.');
      return;
    }

    setLoading(true);
    try {
      const phone = formData.phone.trim()
        ? `${selectedCountry.dial} ${formData.phone.trim()}`
        : '';
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        phone,
        password: formData.password,
        newsletter: formData.newsletter,
        sampleKit: formData.sampleKit,
      });
      setSuccessOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ae-login-screen">
      <div className="ae-login-card ae-register-card">
        <div className="ae-login-inner ae-register-inner">
          <div className="ae-login-brand">
            <BrandLogo variant="auth" />
            <p>Créer un compte atelier — suivi commandes &amp; boutique</p>
          </div>

          {error && <div className="ae-login-error">{error}</div>}

          <div className="ae-sso-row ae-register-sso">
            <button type="button" className="ae-sso-btn" onClick={() => ssoSoon('Apple')}>
              <FaApple size={15} /> Continuer avec Apple
            </button>
            <button type="button" className="ae-sso-btn" onClick={() => ssoSoon('Google')}>
              <GoogleLogo size={15} /> Continuer avec Google
            </button>
          </div>

          <div className="ae-login-divider">Ou par email</div>

          <form onSubmit={handleRegister}>
            <div className="ae-form-grid">
              <div className="ae-field">
                <div className="ae-field-label">
                  <span>Prénom</span>
                </div>
                <div className="ae-input-wrap">
                  <input
                    type="text"
                    placeholder="Arthur"
                    value={formData.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div className="ae-field">
                <div className="ae-field-label">
                  <span>Nom de famille</span>
                </div>
                <div className="ae-input-wrap">
                  <input
                    type="text"
                    placeholder="de Montmirail"
                    value={formData.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="ae-field">
                <div className="ae-field-label">
                  <span>Courriel</span>
                </div>
                <div className="ae-input-wrap">
                  <input
                    type="email"
                    placeholder="arthur.montmirail@studio.com"
                    value={formData.email}
                    onChange={(e) => setField('email', e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="ae-field">
                <div className="ae-field-label">
                  <span>Téléphone portable</span>
                </div>
                <div className="ae-phone-wrap">
                  <select
                    className="ae-phone-prefix"
                    value={formData.countryCode}
                    onChange={(e) => setField('countryCode', e.target.value)}
                    aria-label="Indicatif pays"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.dial} · {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder={selectedCountry.placeholder}
                    value={formData.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    autoComplete="tel-national"
                  />
                </div>
              </div>

              <div className="ae-field">
                <div className="ae-field-label">
                  <span>Mot de passe de sécurité</span>
                </div>
                <div className="ae-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setField('password', e.target.value)}
                    required
                    minLength={12}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Afficher le mot de passe"
                  >
                    {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              <div className="ae-field">
                <div className="ae-field-label">
                  <span>Confirmation</span>
                </div>
                <div className="ae-input-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    required
                    minLength={12}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label="Afficher la confirmation"
                  >
                    {showConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="ae-armor">
              <div className="ae-armor-head">
                <span>Niveau d&apos;armure numérique</span>
                <span className="ae-armor-status">{passwordLabel(score)}</span>
              </div>
              <div className="ae-armor-bar" aria-hidden>
                {[1, 2, 3, 4].map((step) => (
                  <span key={step} className={score >= step ? 'filled' : ''} />
                ))}
              </div>
            </div>

            <div className="ae-register-checks">
              <label>
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setField('newsletter', e.target.checked)}
                />
                <span>
                  Recevoir la revue semestrielle d&apos;architecture, le catalogue relié toile et les
                  invitations aux vernissages de l&apos;Atelier.
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.sampleKit}
                  onChange={(e) => setField('sampleKit', e.target.checked)}
                />
                <span>
                  Commander gracieusement le coffret d&apos;échantillons tactiles (chêne brûlé,
                  travertin romain, laines bouclées alpines).
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setField('acceptTerms', e.target.checked)}
                  required
                />
                <span>
                  J&apos;accepte sans réserve les{' '}
                  <a href="#cge" onClick={(e) => e.preventDefault()}>
                    Conditions Générales d&apos;Édition
                  </a>{' '}
                  et confirme avoir pris connaissance de la{' '}
                  <a href="#privacy" onClick={(e) => e.preventDefault()}>
                    Politique de Confidentialité
                  </a>{' '}
                  (RGPD / Chiffrement 256-bit).
                </span>
              </label>
            </div>

            <button type="submit" className="ae-login-submit" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte atelier →'}
            </button>

            <p className="ae-register-secure">
              <MdLock size={13} />
              Chiffrement matériel SSL 256 bits • Aucun tiers commercial
            </p>
          </form>
        </div>

        <div className="ae-register-footer">
          <span>Vous disposez déjà d&apos;un compte Épure Studio ?</span>
          <Link to="/login">Se connecter à mon espace →</Link>
        </div>
      </div>

      {successOpen && (
        <div className="ae-modal-backdrop ae-success-backdrop" role="presentation">
          <div
            className="ae-modal ae-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ae-register-success-title"
          >
            <div className="ae-success-icon" aria-hidden>
              <MdCheckCircle size={42} />
            </div>
            <h2 id="ae-register-success-title">Compte atelier créé</h2>
            <p>
              Votre espace Épure Studio est prêt. Connectez-vous pour suivre vos commandes et accéder
              à la boutique.
            </p>
            <button
              type="button"
              className="ae-login-submit"
              onClick={() => navigate('/login', { state: { registered: true, email: formData.email.trim() } })}
            >
              Se connecter à mon espace →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
