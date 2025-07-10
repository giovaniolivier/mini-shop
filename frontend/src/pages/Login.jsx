import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link  } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/login', { replace: true });
      setTimeout(() => window.location.reload(), 100);
      alert('Connexion réussie');
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #e0e0e0', padding: 36, minWidth: 340, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ textAlign: 'center', color: '#1976d2', fontWeight: 800, marginBottom: 12 }}>Connexion</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16, outline: 'none' }} />
        <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16, outline: 'none' }} />
        <button type="submit" style={{ background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px #e0e0e0' }}>Se connecter</button>
        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: 15 }}>
          Vous n'avez pas de compte ? <Link to="/register" style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'underline' }}>Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
