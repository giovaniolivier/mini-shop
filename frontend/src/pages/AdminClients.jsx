import React, { useEffect, useState } from 'react';
import { getClients, updateClient } from '../services/api';
import ClientTable from '../components/ClientTable';

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

  // Styles
  const section = { background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0', transition: 'background 0.2s' };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '10px 14px', fontSize: 16, outline: 'none', margin: '0 8px 12px 0', background: '#f8fafc' };

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Gestion des clients</h1>
      {/* Filtres */}
      <section style={section}>
        <input style={input} placeholder="Recherche nom ou email" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={input} value={segment} onChange={e => setSegment(e.target.value)}>
          <option value="">Tous segments</option>
          {SEGMENTS.map(seg => <option key={seg} value={seg}>{seg}</option>)}
        </select>
      </section>
      {/* Liste clients */}
      <ClientTable
        clients={filtered}
        onSelect={selectClient}
        onChangeSegment={changeSegment}
        loading={loading}
        error={error}
        input={input}
        btn={btn}
        segments={SEGMENTS}
      />
      {/* Détail client */}
      {selected && interactions && (
        <section style={section}>
          <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Historique de {selected.name}</h2>
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
                  <span style={{ color: '#f9a825', fontWeight: 600 }}>★{avis.note}</span> {avis.produit} : {avis.texte}
                  {!avis.traite && <button style={btn} onClick={() => markTreated('avis', avis.id)}>Marquer traité</button>}
                  <button style={{ ...btn, background: '#eee', color: '#e53935' }} onClick={() => removeInteraction('avis', avis.id)}>Supprimer</button>
                </li>
              ))}
              {interactions.avis.length === 0 && <li style={{ color: '#888' }}>Aucun avis</li>}
            </ul>
          </div>
          <div>
            <b>Réclamations :</b>
            <ul>
              {interactions.reclamations.map(rec => (
                <li key={rec.id} style={{ marginBottom: 6 }}>
                  <span style={{ color: '#e53935', fontWeight: 600 }}>{rec.sujet}</span> : {rec.message}
                  {!rec.traite && <button style={btn} onClick={() => markTreated('reclamations', rec.id)}>Marquer traité</button>}
                  <button style={{ ...btn, background: '#eee', color: '#e53935' }} onClick={() => removeInteraction('reclamations', rec.id)}>Supprimer</button>
                </li>
              ))}
              {interactions.reclamations.length === 0 && <li style={{ color: '#888' }}>Aucune réclamation</li>}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
} 