import React, { useState } from 'react';
import useFetchSettings from '../hooks/useFetchSettings';
import TransporterTable from '../components/TransporterTable';

const LANGUES = ['Français', 'English', 'Español'];
const DEVISES = ['EUR', 'USD', 'GBP'];
const PAIEMENTS = [
  { key: 'card', label: 'Carte bancaire' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'virement', label: 'Virement bancaire' },
];

export default function AdminSettings() {
  const { settings, loading, error, updateSettings, refresh } = useFetchSettings();
  const [newTransport, setNewTransport] = useState({ nom: '', frais: '', delai: '' });
  const [localError, setLocalError] = useState(null);

  // UI
  const section = { background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' };
  const label = { fontWeight: 600, marginRight: 12 };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '10px 14px', fontSize: 16, outline: 'none', margin: '0 8px 12px 0', background: '#f8fafc' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0', transition: 'background 0.2s' };

  if (loading || !settings) {
    return <div style={{ textAlign: 'center', padding: 64 }}><span style={{ fontSize: 24, color: '#1976d2' }}>Chargement de la configuration...</span></div>;
  }

  // Handlers
  const handleUpdate = (patch) => updateSettings({ ...settings, ...patch });

  // Export/import
  const exportData = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        updateSettings({ ...settings, ...data });
      } catch {
        setLocalError('Fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  // Transporteurs
  const addTransport = async () => {
    if (!newTransport.nom || !newTransport.frais || !newTransport.delai) return;
    try {
      await updateSettings({
        ...settings,
        transporteurs: [...settings.transporteurs, { ...newTransport, frais: Number(newTransport.frais) }],
      });
      setNewTransport({ nom: '', frais: '', delai: '' });
      refresh();
    } catch (err) {
      setLocalError('Erreur lors de l\'ajout du transporteur : ' + err.message);
    }
  };
  const removeTransport = async (idx) => {
    const t = settings.transporteurs[idx];
    if (!window.confirm(`Voulez-vous vraiment supprimer le transporteur "${t?.nom || ''}" ? Cette action est irréversible.`)) return;
    try {
      await updateSettings({
        ...settings,
        transporteurs: settings.transporteurs.filter((_, i) => i !== idx),
      });
      refresh();
    } catch (err) {
      setLocalError('Erreur lors de la suppression du transporteur : ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 900, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Configuration système</h1>
      {/* Paramètres généraux */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Paramètres généraux</h2>
        <div style={{ marginBottom: 16 }}>
          <span style={label}>Devise :</span>
          <select style={input} value={settings.devise} onChange={e => handleUpdate({ devise: e.target.value })}>
            {DEVISES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <span style={label}>Langue :</span>
          <select style={input} value={settings.langue} onChange={e => handleUpdate({ langue: e.target.value })}>
            {LANGUES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <span style={label}>Taux de taxes (%) :</span>
          <input style={input} type="number" min={0} max={100} value={settings.taxes} onChange={e => handleUpdate({ taxes: Number(e.target.value) })} />
        </div>
      </section>
      {/* Modes de paiement */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Modes de paiement</h2>
        <ul style={{ paddingLeft: 0 }}>
          {PAIEMENTS.map(p => (
            <li key={p.key} style={{ fontSize: 17, margin: '8px 0', listStyle: 'none' }}>
              <input type="checkbox" checked={settings.paiements[p.key]} onChange={e => handleUpdate({ paiements: { ...settings.paiements, [p.key]: e.target.checked } })} />
              <span style={{ marginLeft: 8 }}>{p.label}</span>
            </li>
          ))}
        </ul>
      </section>
      {/* Transporteurs */}
      <TransporterTable
        transporteurs={settings.transporteurs || []}
        newTransport={newTransport}
        setNewTransport={setNewTransport}
        onAdd={addTransport}
        onDelete={removeTransport}
        loading={loading}
        error={localError || error}
        input={input}
        btn={btn}
      />
      {/* Sauvegardes et sécurité */}
      <section style={section}>
        <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Sauvegardes & sécurité</h2>
        <button style={btn} onClick={exportData}>Exporter configuration</button>
        <label style={{ ...btn, background: '#eee', color: '#1976d2', cursor: 'pointer' }}>
          Importer configuration
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
        </label>
        <div style={{ marginTop: 18, color: '#888', fontSize: 15 }}>
          <ul>
            <li>Les données sont stockées côté serveur (API).</li>
            <li>Pensez à exporter régulièrement votre configuration.</li>
            <li>Pour la production, activez HTTPS et limitez l'accès admin.</li>
            <li>Changez régulièrement vos mots de passe.</li>
          </ul>
        </div>
      </section>
    </div>
  );
} 