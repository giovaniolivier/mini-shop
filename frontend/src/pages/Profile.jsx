import React, { useState } from 'react';

export default function Profile() {
  // Pour la démo, on stocke les infos utilisateur et adresses localement
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur","email":"demo@mail.com"}'));
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(user);
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem('addresses') || '[]'));
  const [addressForm, setAddressForm] = useState({ label: '', address: '' });
  const [orders] = useState(() => JSON.parse(localStorage.getItem('orders') || '[]'));

  // Sauvegarde profil
  const saveProfile = () => {
    setUser(form);
    localStorage.setItem('user', JSON.stringify(form));
    setEdit(false);
  };

  // Gestion adresses
  const addAddress = () => {
    if (!addressForm.label || !addressForm.address) return;
    const updated = [...addresses, { ...addressForm, id: Date.now() }];
    setAddresses(updated);
    localStorage.setItem('addresses', JSON.stringify(updated));
    setAddressForm({ label: '', address: '' });
  };
  const removeAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('addresses', JSON.stringify(updated));
  };

  // Suivi livraison simulé
  const getStatus = () => {
    const status = ['En préparation', 'Expédié', 'En cours de livraison', 'Livré'];
    return status[Math.floor(Math.random() * status.length)];
  };

  // Styles
  const section = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ececec', padding: 24, margin: '24px 0' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 24, padding: '8px 22px', fontSize: 16, fontWeight: 700, cursor: 'pointer', margin: '0 8px' };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '6px 12px', fontSize: 16, outline: 'none', margin: '0 8px 8px 0' };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1976d2', marginBottom: 32 }}>Mon profil</h1>
      {/* Profil utilisateur */}
      <section style={section}>
        <h2 style={{ fontSize: 22, color: '#1976d2' }}>Mes informations</h2>
        {edit ? (
          <div>
            <input style={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom" />
            <input style={input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
            <input style={input} type="password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mot de passe" />
            <button style={btn} onClick={saveProfile}>Enregistrer</button>
            <button style={{ ...btn, background: '#eee', color: '#222' }} onClick={() => setEdit(false)}>Annuler</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 18, margin: '8px 0' }}><b>Nom :</b> {user.name}</div>
            <div style={{ fontSize: 18, margin: '8px 0' }}><b>Email :</b> {user.email}</div>
            <button style={btn} onClick={() => setEdit(true)}>Modifier</button>
          </div>
        )}
      </section>
      {/* Adresses */}
      <section style={section}>
        <h2 style={{ fontSize: 22, color: '#1976d2' }}>Mes adresses de livraison</h2>
        <div style={{ marginBottom: 16 }}>
          <input style={input} value={addressForm.label} onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))} placeholder="Libellé (ex: Maison)" />
          <input style={input} value={addressForm.address} onChange={e => setAddressForm(f => ({ ...f, address: e.target.value }))} placeholder="Adresse complète" />
          <button style={btn} onClick={addAddress}>Ajouter</button>
        </div>
        <ul>
          {addresses.map(a => (
            <li key={a.id} style={{ fontSize: 17, margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><b>{a.label} :</b> {a.address}</span>
              <button style={{ ...btn, background: '#eee', color: '#e53935' }} onClick={() => removeAddress(a.id)}>Supprimer</button>
            </li>
          ))}
          {addresses.length === 0 && <li style={{ color: '#888' }}>Aucune adresse enregistrée.</li>}
        </ul>
      </section>
      {/* Commandes */}
      <section style={section}>
        <h2 style={{ fontSize: 22, color: '#1976d2' }}>Mes commandes</h2>
        <div style={{ color: '#888', fontSize: 16 }}>
          Retrouvez toutes vos commandes dans l’onglet <b>Commandes</b> du menu à gauche.
        </div>
      </section>
    </div>
  );
} 