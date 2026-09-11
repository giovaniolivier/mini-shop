import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authApi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
          Objets soignés, lignes claires. Une boutique pensée pour l’essentiel.
        </p>
      </div>
      <div className="ae-auth-panel">
        <form className="ae-auth-form" onSubmit={handleLogin}>
          <h1>Connexion</h1>
          <p className="lead">Accédez à votre espace Atelier Épure.</p>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}>
            Se connecter
          </button>
          <p className="ae-auth-foot">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
