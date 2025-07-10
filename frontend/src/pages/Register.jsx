import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Inscription réussie, connectez-vous !');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)' }}>
      <form onSubmit={handleRegister} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #e0e0e0', padding: 36, minWidth: 340, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ textAlign: 'center', color: '#1976d2', fontWeight: 800, marginBottom: 12 }}>Inscription</h2>
        <input type="text" placeholder="Nom" onChange={(e) => setFormData({ ...formData, username: e.target.value })} required style={{ padding: '12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16, outline: 'none' }} />
        <input type="email" placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ padding: '12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16, outline: 'none' }} />
        <input type="password" placeholder="Mot de passe" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required style={{ padding: '12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16, outline: 'none' }} />
        <button type="submit" style={{ background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px #e0e0e0' }}>S'inscrire</button>
        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: 15 }}>
          Vous avez déjà un compte ? <Link to="/login" style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'underline' }}>Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
