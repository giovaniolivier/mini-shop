import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MdPerson,
  MdBusiness,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdVpnKey,
  MdShield,
  MdBolt,
} from 'react-icons/md';
import { FaApple } from 'react-icons/fa';
import { login, forgotPassword } from '../../services/authApi';
import GoogleLogo from '../../components/GoogleLogo';
import BrandLogo from '../../components/BrandLogo';
import '../../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredEmail = location.state?.email || '';
  const infoMessage = location.state?.registered
    ? 'Compte créé avec succès. Connectez-vous pour continuer.'
    : '';
  const [roleIntent, setRoleIntent] = useState('client');
  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => localStorage.getItem('rememberMe') === '1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password, remember);
      const role = res.data.role;

      if (roleIntent === 'admin' && role !== 'admin') {
        setError('Ce compte n’a pas d’accès Pro & Admin. Utilisez l’onglet Compte Client.');
        return;
      }
      if (roleIntent === 'client' && role === 'admin') {
        setError('Compte administrateur détecté. Passez sur l’onglet Pro & Admin.');
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', role);
      localStorage.setItem('rememberMe', remember ? '1' : '0');
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotMsg(res.data.message || 'Si un compte existe, un email a été envoyé.');
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Demande enregistrée.');
    } finally {
      setForgotLoading(false);
    }
  };

  const ssoSoon = (provider) => {
    setError(`Connexion ${provider} : bientôt disponible (OAuth à configurer).`);
  };

  return (
    <div className="ae-login-screen">
      <div className="ae-login-card">
        <div className="ae-login-inner">
          <div className="ae-login-brand">
            <BrandLogo variant="auth" />
            <p>Maison d&apos;édition de mobilier contemporain &amp; architecture intérieure</p>
          </div>

          <div className="ae-role-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={roleIntent === 'client'}
              className={`ae-role-tab${roleIntent === 'client' ? ' active' : ''}`}
              onClick={() => {
                setRoleIntent('client');
                setError('');
              }}
            >
              <MdPerson size={16} /> Compte Client
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={roleIntent === 'admin'}
              className={`ae-role-tab${roleIntent === 'admin' ? ' active' : ''}`}
              onClick={() => {
                setRoleIntent('admin');
                setError('');
              }}
            >
              <MdBusiness size={16} /> Pro &amp; Admin
            </button>
          </div>

          <div className="ae-role-meta">
            <span className="left">
              <span className="dot" />
              {roleIntent === 'client'
                ? 'Espace particulier • Résidentiel'
                : 'Espace professionnel • Admin'}
            </span>
            <span className="right">SSO Actif</span>
          </div>

          {error && <div className="ae-login-error">{error}</div>}
          {infoMessage && !error && <div className="ae-login-info">{infoMessage}</div>}

          <form onSubmit={handleLogin}>
            <div className="ae-field">
              <div className="ae-field-label">
                <span>Adresse email</span>
                <span className="req">Requis</span>
              </div>
              <div className="ae-input-wrap">
                <span className="icon">@</span>
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="ae-field">
              <div className="ae-field-label">
                <span>Mot de passe</span>
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    setForgotOpen(true);
                    setForgotEmail(email);
                    setForgotMsg('');
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="ae-input-wrap">
                <span className="icon">
                  <MdLock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                </button>
              </div>
            </div>

            <div className="ae-login-options">
              <label>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Se souvenir de moi (30 j)
              </label>
              <span className="ae-secure-hint">
                <MdBolt size={14} /> Session sécurisée
              </span>
            </div>

            <button type="submit" className="ae-login-submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Accéder à mon espace sécurisé →'}
            </button>
          </form>

          <div className="ae-login-divider">Ou s&apos;identifier via</div>

          <div className="ae-sso-row">
            <button type="button" className="ae-sso-btn" onClick={() => ssoSoon('Apple')}>
              <FaApple size={15} /> Apple ID
            </button>
            <button type="button" className="ae-sso-btn" onClick={() => ssoSoon('Google')}>
              <GoogleLogo size={15} /> Google
            </button>
          </div>

          <div className="ae-trust-row">
            <div className="ae-trust-box">
              <MdShield size={12} /> Chiffrement AES-256
            </div>
            <div className="ae-trust-box">
              <MdShield size={12} /> 2FA &amp; JWT Certifiés
            </div>
          </div>
        </div>

        <div className="ae-login-cta">
          <h3>
            <span className="key">
              <MdVpnKey size={15} />
            </span>
            Vous n&apos;avez pas encore de compte ?
          </h3>
          <p>
            Créez un compte atelier pour suivre vos commandes, accéder à la boutique et retrouver votre
            historique.
          </p>
          <Link to="/register">Créer un compte atelier ↗</Link>
        </div>

        <div className="ae-login-footer">
          <MdLock size={12} />
          Console d&apos;administration soumise à journalisation IP &amp; audit interne.
        </div>
      </div>

      {forgotOpen && (
        <div className="ae-modal-backdrop" onClick={() => setForgotOpen(false)}>
          <div className="ae-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Mot de passe oublié</h2>
            <p>
              Indiquez votre email. Si un compte existe, vous recevrez les instructions (simulation
              sécurisée).
            </p>
            <form onSubmit={handleForgot}>
              <div className="ae-input-wrap" style={{ marginBottom: 12 }}>
                <span className="icon">@</span>
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              {forgotMsg && (
                <p style={{ color: '#1f3a52', fontSize: '0.9rem', marginBottom: 12 }}>{forgotMsg}</p>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setForgotOpen(false)}>
                  Fermer
                </button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Envoi…' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
