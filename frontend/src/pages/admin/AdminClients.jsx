import React, { useEffect, useState } from 'react';
import { getClients, updateClient } from '../../services/mockApis';
import ClientTable from '../../components/ClientTable';

const SEGMENTS = ['VIP', 'Régulier', 'Nouveau'];

// Données simulées pour la démo
function getDemoClients() {
  const base = JSON.parse(localStorage.getItem('clients') || '[]');
  if (base.length > 0) return base;
  // Générer quelques clients fictifs
  const demo = [
    { id: 1, name: 'Alice Martin', email: 'alice@mail.com', segment: 'VIP', registered: '2023-01-10', orders: 5 },
    { id: 2, name: 'Bob Dupont', email: 'bob@mail.com', segment: 'Régulier', registered: '2023-03-22', orders: 2 },
    { id: 3, name: 'Chloé Petit', email: 'chloe@mail.com', segment: 'Nouveau', registered: '2024-05-01', orders: 0 },
  ];
  localStorage.setItem('clients', JSON.stringify(demo));
  return demo;
}
function getDemoInteractions(clientId) {
  // Simuler commandes, avis, réclamations
  return {
    commandes: [
      { id: 101, date: '2024-05-10', total: 49.99, statut: 'Livrée' },
      { id: 102, date: '2024-05-15', total: 19.99, statut: 'Expédiée' },
    ],
    avis: [
      { id: 201, produit: 'Livre React', note: 5, texte: 'Super livre !', traite: false },
      { id: 202, produit: 'T-shirt', note: 3, texte: 'Taille un peu petite', traite: true },
    ],
    reclamations: [
      { id: 301, sujet: 'Livraison en retard', message: 'Ma commande est arrivée en retard.', traite: false },
    ],
  };
}

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('');
  const [selected, setSelected] = useState(null);
  const [interactions, setInteractions] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des clients : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const filtered = clients.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (!segment || c.segment === segment)
  );

  // Sélection d'un client
  const selectClient = (client) => {
    setSelected(client);
    // Ici tu peux charger les interactions réelles via l'API si besoin
    setInteractions({ commandes: [], avis: [], reclamations: [] });
  };
  // Changer segment
  const changeSegment = async (id, seg) => {
    try {
      await updateClient(id, { segment: seg });
      setClients(prev => prev.map(c => c.id === id ? { ...c, segment: seg } : c));
    } catch (err) {
      setError('Erreur lors du changement de segment : ' + (err.response?.data?.message || err.message));
    }
  };
  // Marquer avis/réclamation comme traité
  const markTreated = (type, id) => {
    setInteractions(prev => ({
      ...prev,
      [type]: prev[type].map(i => i.id === id ? { ...i, traite: true } : i)
    }));
  };
  // Supprimer avis/réclamation
  const removeInteraction = (type, id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.')) return;
    setInteractions(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i.id !== id)
    }));
  };

  return (
    <div className="ae-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="ae-page-title">Clients</h1>
      <p className="ae-page-sub">Relation client Atelier Épure</p>
      <section className="surface" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: '1 1 200px' }} placeholder="Recherche nom ou email" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ width: 180 }} value={segment} onChange={e => setSegment(e.target.value)}>
          <option value="">Tous segments</option>
          {SEGMENTS.map(seg => <option key={seg} value={seg}>{seg}</option>)}
        </select>
      </section>
      <ClientTable
        clients={filtered}
        onSelect={selectClient}
        onChangeSegment={changeSegment}
        loading={loading}
        error={error}
        segments={SEGMENTS}
      />
      {selected && interactions && (
        <section className="surface" style={{ padding: '1.35rem', marginTop: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Historique de {selected.name}</h2>
          <div style={{ marginBottom: 18 }}><b>Email :</b> {selected.email} | <b>Segment :</b> {selected.segment} | <b>Inscription :</b> {selected.registered}</div>
          <div style={{ marginBottom: 12 }}>
            <b>Commandes :</b>
            <ul>
              {interactions.commandes.map(cmd => (
                <li key={cmd.id}>{cmd.date} - {cmd.total} € - {cmd.statut}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: 12 }}>
            <b>Avis :</b>
            <ul>
              {interactions.avis.map(avis => (
                <li key={avis.id} style={{ marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>★{avis.note}</span> {avis.produit} : {avis.texte}
                  {!avis.traite && <button type="button" className="btn btn-outline" style={{ marginLeft: 8, padding: '4px 10px' }} onClick={() => markTreated('avis', avis.id)}>Marquer traité</button>}
                  <button type="button" className="btn btn-danger" style={{ marginLeft: 8, padding: '4px 10px' }} onClick={() => removeInteraction('avis', avis.id)}>Supprimer</button>
                </li>
              ))}
              {interactions.avis.length === 0 && <li style={{ color: 'var(--color-muted)' }}>Aucun avis</li>}
            </ul>
          </div>
          <div>
            <b>Réclamations :</b>
            <ul>
              {interactions.reclamations.map(rec => (
                <li key={rec.id} style={{ marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{rec.sujet}</span> : {rec.message}
                  {!rec.traite && <button type="button" className="btn btn-outline" style={{ marginLeft: 8, padding: '4px 10px' }} onClick={() => markTreated('reclamations', rec.id)}>Marquer traité</button>}
                  <button type="button" className="btn btn-danger" style={{ marginLeft: 8, padding: '4px 10px' }} onClick={() => removeInteraction('reclamations', rec.id)}>Supprimer</button>
                </li>
              ))}
              {interactions.reclamations.length === 0 && <li style={{ color: 'var(--color-muted)' }}>Aucune réclamation</li>}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
} 