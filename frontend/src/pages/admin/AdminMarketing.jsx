import React, { useState } from 'react';

// Données simulées pour la démo
function getDemoPromos() {
  return JSON.parse(localStorage.getItem('promos') || '[]');
}
function getDemoBanners() {
  return JSON.parse(localStorage.getItem('banners') || '[]');
}
function getDemoCampaigns() {
  return JSON.parse(localStorage.getItem('campaigns') || '[]');
}

export default function AdminMarketing() {
  // Codes promo
  const [promos, setPromos] = useState(getDemoPromos());
  const [promoForm, setPromoForm] = useState({ code: '', type: 'pourcentage', value: '', validUntil: '' });
  // Campagnes email
  const [campaigns, setCampaigns] = useState(getDemoCampaigns());
  const [campForm, setCampForm] = useState({ subject: '', content: '', segment: '' });
  // Bannières
  const [banners, setBanners] = useState(getDemoBanners());
  const [bannerForm, setBannerForm] = useState({ image: '', link: '', start: '', end: '' });
  // Fidélité (simulé)
  const [loyalty, setLoyalty] = useState({ points: 120, level: 'Or' });

  // Promo CRUD
  const addPromo = () => {
    if (!promoForm.code || !promoForm.value) return;
    const updated = [...promos, { ...promoForm, id: Date.now() }];
    setPromos(updated);
    localStorage.setItem('promos', JSON.stringify(updated));
    setPromoForm({ code: '', type: 'pourcentage', value: '', validUntil: '' });
  };
  const removePromo = (id) => {
    const updated = promos.filter(p => p.id !== id);
    setPromos(updated);
    localStorage.setItem('promos', JSON.stringify(updated));
  };
  // Campagne CRUD
  const addCampaign = () => {
    if (!campForm.subject || !campForm.content) return;
    const updated = [...campaigns, { ...campForm, id: Date.now() }];
    setCampaigns(updated);
    localStorage.setItem('campaigns', JSON.stringify(updated));
    setCampForm({ subject: '', content: '', segment: '' });
  };
  // Bannière CRUD
  const addBanner = () => {
    if (!bannerForm.image) return;
    const updated = [...banners, { ...bannerForm, id: Date.now() }];
    setBanners(updated);
    localStorage.setItem('banners', JSON.stringify(updated));
    setBannerForm({ image: '', link: '', start: '', end: '' });
  };
  const removeBanner = (id) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    localStorage.setItem('banners', JSON.stringify(updated));
  };

  // Styles
  const section = { background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0', transition: 'background 0.2s' };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '10px 14px', fontSize: 16, outline: 'none', margin: '0 8px 12px 0', background: '#f8fafc' };

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Marketing & Promotions</h1>
      {/* Codes promo */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Codes promo</h2>
        <div style={{ marginBottom: 12 }}>
          <input style={input} placeholder="Code" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value }))} />
          <select style={input} value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}>
            <option value="pourcentage">% réduction</option>
            <option value="montant">Montant fixe (€)</option>
          </select>
          <input style={input} type="number" placeholder="Valeur" value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))} />
          <input style={input} type="date" value={promoForm.validUntil} onChange={e => setPromoForm(f => ({ ...f, validUntil: e.target.value }))} />
          <button style={btn} onClick={addPromo}>Ajouter</button>
        </div>
        <ul style={{ paddingLeft: 0 }}>
          {promos.map(p => (
            <li key={p.id} style={{ marginBottom: 6, listStyle: 'none' }}>
              <b>{p.code}</b> - {p.type === 'pourcentage' ? p.value + '%' : p.value + '€'} {p.validUntil && <span>(jusqu'au {p.validUntil})</span>}
              <button style={{ ...btn, background: '#eee', color: '#e53935' }} onClick={() => removePromo(p.id)}>Supprimer</button>
            </li>
          ))}
          {promos.length === 0 && <li style={{ color: '#888', listStyle: 'none' }}>Aucun code promo</li>}
        </ul>
      </section>
      {/* Campagnes email */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Campagnes email</h2>
        <div style={{ marginBottom: 12 }}>
          <input style={input} placeholder="Sujet" value={campForm.subject} onChange={e => setCampForm(f => ({ ...f, subject: e.target.value }))} />
          <input style={input} placeholder="Segment (optionnel)" value={campForm.segment} onChange={e => setCampForm(f => ({ ...f, segment: e.target.value }))} />
          <textarea style={{ ...input, minHeight: 60, width: 300 }} placeholder="Contenu" value={campForm.content} onChange={e => setCampForm(f => ({ ...f, content: e.target.value }))} />
          <button style={btn} onClick={addCampaign}>Créer campagne</button>
        </div>
        <ul style={{ paddingLeft: 0 }}>
          {campaigns.map(c => (
            <li key={c.id} style={{ marginBottom: 10, listStyle: 'none' }}>
              <b>{c.subject}</b> {c.segment && <span>(segment : {c.segment})</span>}
              <div style={{ fontSize: 15, color: '#555', margin: '4px 0' }}>{c.content}</div>
            </li>
          ))}
          {campaigns.length === 0 && <li style={{ color: '#888', listStyle: 'none' }}>Aucune campagne</li>}
        </ul>
      </section>
      {/* Fidélité */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Programme de fidélité</h2>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Points actuels : <b>{loyalty.points}</b></div>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Niveau : <b>{loyalty.level}</b></div>
        <div style={{ color: '#888', fontSize: 15 }}>Pour la démo, le programme est simulé.</div>
      </section>
      {/* Bannières */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Bannières publicitaires</h2>
        <div style={{ marginBottom: 12 }}>
          <input style={input} placeholder="Image URL" value={bannerForm.image} onChange={e => setBannerForm(f => ({ ...f, image: e.target.value }))} />
          <input style={input} placeholder="Lien (optionnel)" value={bannerForm.link} onChange={e => setBannerForm(f => ({ ...f, link: e.target.value }))} />
          <input style={input} type="date" value={bannerForm.start} onChange={e => setBannerForm(f => ({ ...f, start: e.target.value }))} />
          <input style={input} type="date" value={bannerForm.end} onChange={e => setBannerForm(f => ({ ...f, end: e.target.value }))} />
          <button style={btn} onClick={addBanner}>Ajouter</button>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {banners.map(b => (
            <div key={b.id} style={{ background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 16, minWidth: 220 }}>
              {b.image && <img src={b.image} alt="bannière" style={{ width: 180, borderRadius: 8, marginBottom: 8 }} />}
              {b.link && <div style={{ fontSize: 14, color: '#1976d2' }}>Lien : {b.link}</div>}
              {b.start && <div style={{ fontSize: 13, color: '#888' }}>Début : {b.start}</div>}
              {b.end && <div style={{ fontSize: 13, color: '#888' }}>Fin : {b.end}</div>}
              <button style={{ ...btn, background: '#eee', color: '#e53935', marginTop: 8 }} onClick={() => removeBanner(b.id)}>Supprimer</button>
            </div>
          ))}
          {banners.length === 0 && <span style={{ color: '#888' }}>Aucune bannière</span>}
        </div>
      </section>
    </div>
  );
} 