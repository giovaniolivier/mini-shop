import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/authApi';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      alert('Inscription réussie, connectez-vous !');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="ae-auth">
      <div className="ae-auth-visual">
        <h1 className="ae-auth-brand">
          Atelier <span>Épure</span>
        </h1>
        <p className="ae-auth-tagline">
          Rejoignez une expérience d’achat minimaliste, centrée sur la qualité.
        </p>
      </div>
      <div className="ae-auth-panel">
        <form className="ae-auth-form" onSubmit={handleRegister}>
          <h1>Inscription</h1>
          <p className="lead">Créez votre compte client.</p>
          <input
            className="input"
            type="text"
            placeholder="Nom"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}>
            S&apos;inscrire
          </button>
          <p className="ae-auth-foot">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
