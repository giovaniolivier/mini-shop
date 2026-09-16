import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArchitecture,
  MdCheckCircle,
  MdEco,
  MdFavoriteBorder,
  MdHandyman,
  MdLocationOn,
  MdPlayArrow,
  MdSchedule,
  MdShield,
  MdVerified,
} from 'react-icons/md';
import {
  ARTISANAT_CREATIONS,
  ARTISANAT_MATERIALS,
  ARTISANAT_PILLARS,
  ARTISANAT_STATS,
} from '../../data/artisanatDemo';
import '../../styles/artisanat.css';

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

const STAT_ICONS = {
  compass: MdArchitecture,
  leaf: MdEco,
  pin: MdLocationOn,
  shield: MdShield,
};

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  interest: 'Visite atelier',
  slot: 'Matin',
  materials: [],
};

export default function ArtisanatArt() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const toggleMaterial = (m) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.includes(m)
        ? prev.materials.filter((x) => x !== m)
        : [...prev.materials, m],
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      flash('Indiquez au moins votre nom et votre e-mail.');
      return;
    }
    flash('Demande de session privée envoyée.');
    setForm(INITIAL_FORM);
  };

  return (
    <div className="ae-art">
      <div className="ae-art-inner">
        <header className="ae-art-hero">
          <div className="ae-art-hero-top">
            <div>
              <p className="ae-art-chip">
                <MdHandyman size={14} aria-hidden />
                Édition &amp; métiers rares
              </p>
              <h1>Les Gestes d’Atelier &amp; Savoir-Faire d’Exception</h1>
              <p className="ae-art-lead">
                De la tension minérale des carrières de Tivoli aux établis du Faubourg
                Saint-Antoine, Épure Studio célèbre l’alliance indissociable du temps long, de
                la matière vivante et du tracé architectural.
              </p>
            </div>
            <aside className="ae-art-badge">
              <span className="ae-art-badge-row">
                <MdHandyman size={16} aria-hidden />
                Atelier fondateur
              </span>
              <strong>Paris XIᵉ &amp; Latium</strong>
            </aside>
          </div>

          <figure className="ae-art-hero-media">
            <img
              src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&h=900&fit=crop"
              alt="Artisan au travail dans l’atelier Épure"
            />
            <figcaption>
              <span className="ae-art-immersion">Immersion exclusive</span>
              <p>
                « La main n’exécute pas seulement l’idée de l’architecte, elle en révèle la
                texture secrète. »
              </p>
              <cite>Jean-Baptiste Vaneck — Maître d’Œuvre &amp; Compagnon du Devoir</cite>
            </figcaption>
          </figure>
        </header>

        {toast && <div className="ae-art-toast">{toast}</div>}

        <section className="ae-art-section">
          <div className="ae-art-section-head">
            <h2>Les Quatre Piliers d’Atelier</h2>
            <p>
              Quatre matières nobles, une même exigence : la lecture du matériau avant toute
              mise en forme.
            </p>
          </div>
          <div className="ae-art-pillars">
            {ARTISANAT_PILLARS.map((p) => (
              <article key={p.id} className="ae-art-pillar">
                <div className="ae-art-pillar-media">
                  <span className="ae-art-pillar-label">{p.label}</span>
                  <img src={p.image} alt={p.title} loading="lazy" />
                  <span className="ae-art-play">
                    <MdPlayArrow size={18} aria-hidden />
                    {p.duration}
                  </span>
                </div>
                <div className="ae-art-pillar-body">
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <div className="ae-art-pillar-note">{p.detail}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ae-art-section">
          <div className="ae-art-section-head ae-art-section-head--row">
            <h2>Nouvelles Créations d’Atelier</h2>
            <Link to="/home" className="ae-art-link">
              Explorer toute la collection →
            </Link>
          </div>
          <div className="ae-art-creations">
            {ARTISANAT_CREATIONS.map((c) => (
              <article key={c.id} className="ae-art-card">
                <div className="ae-art-card-media">
                  <img src={c.image} alt={c.name} loading="lazy" />
                  <span className="ae-art-card-badge">{c.badge}</span>
                  <button type="button" className="ae-art-wish" aria-label="Favoris">
                    <MdFavoriteBorder size={18} />
                  </button>
                </div>
                <div className="ae-art-card-body">
                  <h3>{c.name}</h3>
                  <p>{c.material}</p>
                  <div className="ae-art-card-foot">
                    <strong>{formatEuro(c.price)}</strong>
                    <Link to="/home" className="ae-art-discover">
                      Découvrir
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="ae-art-manifesto">
        <div className="ae-art-inner ae-art-manifesto-grid">
          <div className="ae-art-manifesto-copy">
            <p className="ae-art-manifesto-kicker">
              <MdCheckCircle size={16} aria-hidden />
              Exigence fondamentale
            </p>
            <h2>Le Manifeste de la Matière Vivante</h2>
            <p>
              Nous refusons l’uniformité synthétique et l’obsolescence programmée des intérieurs
              éphémères. Chez Épure Studio, chaque création est pensée pour se patiner avec majesté
              au fil des décennies.
            </p>
            <ul>
              <li>
                <MdVerified size={18} aria-hidden />
                <span>
                  <strong>Pureté absolue des liants :</strong> Aucune résine chimique ni composé
                  organique volatil lors de la finition.
                </span>
              </li>
              <li>
                <MdVerified size={18} aria-hidden />
                <span>
                  <strong>Certificat de filiation minérale :</strong> Chaque objet est livré avec
                  ses coordonnées géologiques de carrière.
                </span>
              </li>
            </ul>
          </div>
          <div className="ae-art-stats">
            {ARTISANAT_STATS.map((s) => {
              const Icon = STAT_ICONS[s.icon] || MdVerified;
              return (
                <div key={s.title} className="ae-art-stat">
                  <Icon size={20} className="ae-art-stat-icon" aria-hidden />
                  <strong>{s.value}</strong>
                  <em>{s.title}</em>
                  <span>{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ae-art-visit">
        <div className="ae-art-inner ae-art-visit-grid">
          <div className="ae-art-visit-copy">
            <h2>Visiter l’Atelier Parisien sur Rendez-vous Privé</h2>
            <p>
              Découvrez les matières en cours de façonnage, les planches d’essais et les
              éditions numérotées dans un cadre confidentiel réservé aux projets sérieux.
            </p>
            <div className="ae-art-visit-meta">
              <p>
                <MdLocationOn size={18} aria-hidden />
                Atelier Paris 10e — sur rendez-vous uniquement
              </p>
              <p>
                <MdSchedule size={18} aria-hidden />
                Mardi – Vendredi · 10h – 18h
              </p>
            </div>
          </div>

          <form className="ae-art-form" onSubmit={submit}>
            <h3>Demande de Session Privée</h3>
            <div className="ae-art-form-grid">
              <label>
                Nom
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@email.com"
                />
              </label>
              <label>
                Téléphone
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+33…"
                />
              </label>
              <label>
                Société
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Agence / atelier"
                />
              </label>
              <label>
                Objet de la visite
                <select
                  value={form.interest}
                  onChange={(e) => setForm({ ...form, interest: e.target.value })}
                >
                  <option>Visite atelier</option>
                  <option>Projet résidence</option>
                  <option>Projet hospitalité</option>
                  <option>Édition sur mesure</option>
                </select>
              </label>
              <label>
                Créneau souhaité
                <select
                  value={form.slot}
                  onChange={(e) => setForm({ ...form, slot: e.target.value })}
                >
                  <option>Matin</option>
                  <option>Après-midi</option>
                  <option>Flexible</option>
                </select>
              </label>
            </div>

            <p className="ae-art-form-label">Matières de prédilection</p>
            <div className="ae-art-checks">
              {ARTISANAT_MATERIALS.map((m) => (
                <label key={m} className="ae-art-check">
                  <input
                    type="checkbox"
                    checked={form.materials.includes(m)}
                    onChange={() => toggleMaterial(m)}
                  />
                  {m}
                </label>
              ))}
            </div>

            <button type="submit" className="ae-art-submit">
              Réserver ma session privée
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
