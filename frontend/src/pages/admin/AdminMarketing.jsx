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

  return (
    <div className="ae-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="ae-page-title">Marketing</h1>
      <p className="ae-page-sub">Promotions et campagnes Atelier Épure</p>
      {/* Codes promo */}
      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Codes promo</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <input className="input" style={{ width: 120 }} placeholder="Code" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value }))} />
          <select className="input" style={{ width: 150 }} value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}>
            <option value="pourcentage">% réduction</option>
            <option value="montant">Montant fixe (€)</option>
          </select>
          <input className="input" style={{ width: 100 }} type="number" placeholder="Valeur" value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))} />
          <input className="input" style={{ width: 150 }} type="date" value={promoForm.validUntil} onChange={e => setPromoForm(f => ({ ...f, validUntil: e.target.value }))} />
          <button type="button" className="btn btn-primary" onClick={addPromo}>Ajouter</button>
        </div>
        <ul style={{ paddingLeft: 0, margin: 0 }}>
          {promos.map(p => (
            <li key={p.id} style={{ marginBottom: 8, listStyle: 'none', display: 'flex', gap: 10, alignItems: 'center' }}>
              <b>{p.code}</b> — {p.type === 'pourcentage' ? p.value + '%' : p.value + '€'} {p.validUntil && <span>(jusqu&apos;au {p.validUntil})</span>}
              <button type="button" className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => removePromo(p.id)}>Supprimer</button>
            </li>
          ))}
          {promos.length === 0 && <li style={{ color: 'var(--color-muted)', listStyle: 'none' }}>Aucun code promo</li>}
        </ul>
      </section>
      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Campagnes email</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <input className="input" style={{ flex: '1 1 160px' }} placeholder="Sujet" value={campForm.subject} onChange={e => setCampForm(f => ({ ...f, subject: e.target.value }))} />
          <input className="input" style={{ flex: '1 1 140px' }} placeholder="Segment" value={campForm.segment} onChange={e => setCampForm(f => ({ ...f, segment: e.target.value }))} />
          <textarea className="input" style={{ flex: '1 1 100%', minHeight: 72 }} placeholder="Contenu" value={campForm.content} onChange={e => setCampForm(f => ({ ...f, content: e.target.value }))} />
          <button type="button" className="btn btn-primary" onClick={addCampaign}>Créer campagne</button>
        </div>
        <ul style={{ paddingLeft: 0, margin: 0 }}>
          {campaigns.map(c => (
            <li key={c.id} style={{ marginBottom: 10, listStyle: 'none' }}>
              <b>{c.subject}</b> {c.segment && <span>(segment : {c.segment})</span>}
              <div style={{ fontSize: 14, color: 'var(--color-muted)', margin: '4px 0' }}>{c.content}</div>
            </li>
          ))}
          {campaigns.length === 0 && <li style={{ color: 'var(--color-muted)', listStyle: 'none' }}>Aucune campagne</li>}
        </ul>
      </section>
      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Fidélité</h2>
        <div>Points : <b>{loyalty.points}</b> — Niveau : <b>{loyalty.level}</b></div>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Simulation pour la démo.</p>
      </section>
      <section className="surface" style={{ padding: '1.35rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Bannières</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <input className="input" style={{ flex: '1 1 160px' }} placeholder="Image URL" value={bannerForm.image} onChange={e => setBannerForm(f => ({ ...f, image: e.target.value }))} />
          <input className="input" style={{ flex: '1 1 140px' }} placeholder="Lien" value={bannerForm.link} onChange={e => setBannerForm(f => ({ ...f, link: e.target.value }))} />
          <input className="input" style={{ width: 140 }} type="date" value={bannerForm.start} onChange={e => setBannerForm(f => ({ ...f, start: e.target.value }))} />
          <input className="input" style={{ width: 140 }} type="date" value={bannerForm.end} onChange={e => setBannerForm(f => ({ ...f, end: e.target.value }))} />
          <button type="button" className="btn btn-primary" onClick={addBanner}>Ajouter</button>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {banners.map(b => (
            <div key={b.id} className="surface" style={{ padding: 14, minWidth: 200 }}>
              {b.image && <img src={b.image} alt="bannière" style={{ width: 160, borderRadius: 8, marginBottom: 8 }} />}
              {b.link && <div style={{ fontSize: 13 }}>Lien : {b.link}</div>}
              <button type="button" className="btn btn-danger" style={{ marginTop: 8, padding: '4px 10px' }} onClick={() => removeBanner(b.id)}>Supprimer</button>
            </div>
          ))}
          {banners.length === 0 && <span style={{ color: 'var(--color-muted)' }}>Aucune bannière</span>}
        </div>
      </section>
    </div>
  );
} 