import React, { useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur","email":"demo@mail.com"}')
  );
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(user);
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem('addresses') || '[]'));
  const [addressForm, setAddressForm] = useState({ label: '', address: '' });

  const saveProfile = () => {
    setUser(form);
    localStorage.setItem('user', JSON.stringify(form));
    setEdit(false);
  };

  const addAddress = () => {
    if (!addressForm.label || !addressForm.address) return;
    const updated = [...addresses, { ...addressForm, id: Date.now() }];
    setAddresses(updated);
    localStorage.setItem('addresses', JSON.stringify(updated));
    setAddressForm({ label: '', address: '' });
  };

  const removeAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('addresses', JSON.stringify(updated));
  };

  return (
    <div className="ae-page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="ae-page-title">Mon profil</h1>
      <p className="ae-page-sub">Informations personnelles Atelier Épure.</p>

      <section className="surface" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Mes informations</h2>
        {edit ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom" />
            <input className="input" value={form.email || ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary" onClick={saveProfile}>
                Enregistrer
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(false)}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ margin: '0 0 6px' }}>
              <b>Nom :</b> {user.name}
            </p>
            <p style={{ margin: '0 0 14px' }}>
              <b>Email :</b> {user.email}
            </p>
            <button type="button" className="btn btn-outline" onClick={() => setEdit(true)}>
              Modifier
            </button>
          </div>
        )}
      </section>

      <section className="surface" style={{ padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Adresses de livraison</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: '1 1 140px' }}
            value={addressForm.label}
            onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Libellé"
          />
          <input
            className="input"
            style={{ flex: '2 1 220px' }}
            value={addressForm.address}
            onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Adresse complète"
          />
          <button type="button" className="btn btn-primary" onClick={addAddress}>
            Ajouter
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {addresses.map((a) => (
            <li
              key={a.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>
                <b>{a.label} :</b> {a.address}
              </span>
              <button type="button" className="btn btn-danger" onClick={() => removeAddress(a.id)}>
                Supprimer
              </button>
            </li>
          ))}
          {addresses.length === 0 && <li style={{ color: 'var(--color-muted)' }}>Aucune adresse enregistrée.</li>}
        </ul>
      </section>
    </div>
  );
}
