import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd, MdCheck, MdStar } from 'react-icons/md';
import {
  ALBATRE_PRODUCTS,
  CERAMIQUE_PRODUCTS,
  COLLECTIONS_FILTERS,
  COLLECTIONS_IMAGES,
  COLLECTIONS_SWATCHES,
  MONOLITHES_PRODUCTS,
  SOLSTICE,
} from '../../data/collectionsDemo';
import '../../styles/collections.css';

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

const INITIAL_FORM = {
  name: '',
  email: '',
  project: 'Résidentiel',
  message: '',
};

function ProductTile({ product, onAdd }) {
  return (
    <article className="ae-col-product">
      <div className="ae-col-product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="ae-col-product-body">
        <h3>{product.name}</h3>
        <p>{product.text}</p>
        <div className="ae-col-product-row">
          <strong>{formatEuro(product.price)}</strong>
          <button
            type="button"
            className="ae-col-plus"
            aria-label={`Ajouter ${product.name}`}
            onClick={() => onAdd(product.name)}
          >
            <MdAdd size={18} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CollectionsSignatures() {
  const [activeFilter, setActiveFilter] = useState('monolithes');
  const [form, setForm] = useState(INITIAL_FORM);
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const scrollTo = (id, sectionId = id) => {
    setActiveFilter(id);
    const el = document.getElementById(`col-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      flash('Indiquez au moins votre nom et votre e-mail.');
      return;
    }
    flash('Demande transmise au bureau d’études.');
    setForm(INITIAL_FORM);
  };

  return (
    <div className="ae-col">
      {toast ? <div className="ae-col-toast">{toast}</div> : null}

      <div className="ae-col-inner">
        <header className="ae-col-hero">
          <div className="ae-col-hero-top">
            <div>
              <p className="ae-col-crumb">
                Lookbook éditorial · Volume IV
                <span aria-hidden> —— </span>
                Automne / Hiver 2024
              </p>
              <h1>Les Collections Signatures</h1>
              <p className="ae-col-lead">
                Des lignes architecturales sculptées dans la matière brute —
                un dialogue poétique entre pierre, lumière et édition limitée.
              </p>
            </div>
            <div className="ae-col-tags">
              <div className="ae-col-tag">
                <span>Atelier de fonte</span>
                <strong>Paris &amp; Carrare</strong>
              </div>
              <div className="ae-col-tag">
                <span>Pièces certifiées</span>
                <strong className="ae-col-tag-accent">100% Signées</strong>
              </div>
            </div>
          </div>

          <nav className="ae-col-filters" aria-label="Filtres collections">
            {COLLECTIONS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`ae-col-filter${activeFilter === f.id ? ' is-active' : ''}`}
                onClick={() =>
                  scrollTo(f.id, f.id === 'editions' ? 'solstice' : f.id)
                }
              >
                {f.star ? <MdStar size={13} aria-hidden /> : null}
                <span className="ae-col-filter-num">{f.num}.</span>
                {f.label}
                {activeFilter === f.id ? (
                  <i className="ae-col-filter-dot" aria-hidden />
                ) : null}
              </button>
            ))}
          </nav>
        </header>

        {/* Monolithes */}
        <section id="col-monolithes" className="ae-col-block">
          <div className="ae-col-chapter">
            <p className="ae-col-chapter-kicker">Chapitre 01 — Monumentalité intérieure</p>
            <div className="ae-col-chapter-row">
              <h2>Collection Monolithes — La permanence minérale.</h2>
              <div className="ae-col-chapter-aside">
                <p>
                  Exploration des masses géométriques et des blocs de pierre
                  taillés pour des intérieurs d’exception — volumes quietes,
                  joints invisibles, patine vivante.
                </p>
                <span>Tirages limités à 30 exemplaires</span>
              </div>
            </div>
          </div>

          <figure className="ae-col-scene">
            <img src={COLLECTIONS_IMAGES.monolithes} alt="" loading="lazy" />
            <figcaption>
              <span className="ae-col-scene-tag">Mise en scène n° 08 — Villa Bellagio</span>
              <strong>L’assise et la table ‘Arche I’</strong>
              <p>
                Travertin romain beige sablé, finitions huilées à la main par
                nos maîtres artisans tailleurs de pierre.
              </p>
            </figcaption>
          </figure>

          <div className="ae-col-mono-grid">
            <aside className="ae-col-swatch">
              <h2>Nuancier Matières Brutes</h2>
              <ul>
                {COLLECTIONS_SWATCHES.map((s) => (
                  <li key={s.id}>
                    <span
                      className="ae-col-swatch-dot"
                      style={{ background: s.tone }}
                      aria-hidden
                    />
                    {s.name}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="ae-col-swatch-cta"
                onClick={() => flash('Demande d’échantillon enregistrée.')}
              >
                Demander un échantillon matière
              </button>
            </aside>

            <div className="ae-col-products ae-col-products-3">
              {MONOLITHES_PRODUCTS.map((p) => (
                <ProductTile
                  key={p.id}
                  product={p}
                  onAdd={(name) => flash(`${name} ajouté à la sélection.`)}
                />
              ))}
            </div>
          </div>

          <Link to="/home" className="ae-col-explore">
            Explorer l’intégralité de la Collection Monolithes →
          </Link>
        </section>

        {/* Albâtre */}
        <section id="col-albatre" className="ae-col-block ae-col-split">
          <figure className="ae-col-feature">
            <img src={COLLECTIONS_IMAGES.albatre} alt="" loading="lazy" />
            <blockquote>
              « L’albâtre ne filtre pas le jour, il en devient l’âme. »
              <cite>Studio de recherche luminaire</cite>
            </blockquote>
          </figure>

          <div className="ae-col-split-copy">
            <h2>Ligne Albâtre &amp; Laiton Doré</h2>
            <p>
              Volumes translucides et structures dorées pour des ambiances
              nocturnes architecturales, façonnées pièce par pièce.
            </p>
            <div className="ae-col-products ae-col-products-2">
              {ALBATRE_PRODUCTS.map((p) => (
                <ProductTile
                  key={p.id}
                  product={p}
                  onAdd={(name) => flash(`${name} ajouté à la sélection.`)}
                />
              ))}
            </div>
            <Link to="/artisanat" className="ae-col-btn ae-col-btn-dark">
              Découvrir l’Artisanat d’Art →
            </Link>
          </div>
        </section>

        {/* Céramique */}
        <section id="col-ceramique" className="ae-col-block ae-col-split ae-col-split-flip">
          <div className="ae-col-split-copy">
            <h2>Céramique de Terre Chamottée</h2>
            <p>
              Pièces d’apparat tournées à la main, textures minérales et émaux
              mates pour des gestes sculpturaux au quotidien.
            </p>
            <div className="ae-col-products ae-col-products-2">
              {CERAMIQUE_PRODUCTS.map((p) => (
                <ProductTile
                  key={p.id}
                  product={p}
                  onAdd={(name) => flash(`${name} ajouté à la sélection.`)}
                />
              ))}
            </div>
            <Link to="/collection-privee" className="ae-col-btn ae-col-btn-outline">
              Voir les pièces d’exception →
            </Link>
          </div>

          <figure className="ae-col-feature ae-col-feature-tall">
            <img src={COLLECTIONS_IMAGES.ceramique} alt="" loading="lazy" />
            <figcaption>
              <strong>Savoir-faire</strong>
              Tournage, chamotte et cuisson haute température en atelier.
            </figcaption>
          </figure>
        </section>
      </div>

      {/* Capsule Solstice */}
      <section id="col-solstice" className="ae-col-solstice">
        <div className="ae-col-inner ae-col-solstice-grid">
          <div className="ae-col-solstice-copy">
            <p className="ae-col-solstice-kicker">Projet spécial · Édition limitée</p>
            <h2>{SOLSTICE.title}</h2>
            <p>{SOLSTICE.text}</p>
            <div className="ae-col-solstice-stats">
              <div>
                <strong>{String(SOLSTICE.exemplaires).padStart(2, '0')}</strong>
                <span>Exemplaires</span>
              </div>
              <div>
                <strong>{String(SOLSTICE.reserves).padStart(2, '0')}</strong>
                <span>Déjà réservés</span>
              </div>
              <div>
                <strong>{String(SOLSTICE.disponibles).padStart(2, '0')}</strong>
                <span>Disponibles</span>
              </div>
            </div>
            <div className="ae-col-solstice-actions">
              <button
                type="button"
                className="ae-col-btn ae-col-btn-copper"
                onClick={() => flash('Demande d’accès vente privée envoyée.')}
              >
                Demander accès vente privée
              </button>
              <button
                type="button"
                className="ae-col-btn ae-col-btn-ghost"
                onClick={() => flash('Lookbook Solstice bientôt disponible.')}
              >
                Voir le lookbook de la série
              </button>
            </div>
          </div>

          <figure className="ae-col-solstice-media">
            <img src={SOLSTICE.image} alt={SOLSTICE.product} loading="lazy" />
            <figcaption>
              <span>{SOLSTICE.product}</span>
              <strong>{formatEuro(SOLSTICE.price)}</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Sur-mesure */}
      <section className="ae-col-bespoke">
        <div className="ae-col-inner ae-col-bespoke-card">
          <div className="ae-col-bespoke-copy">
            <h2>Commande Spéciale &amp; Finitions Sur-Mesure</h2>
            <p>
              Le bureau d’études accompagne résidences, hospices privés et
              projets d’architecte pour des finitions exclusives.
            </p>
            <ul>
              <li>
                <MdCheck size={16} aria-hidden />
                Résidentiel &amp; hospices privés
              </li>
              <li>
                <MdCheck size={16} aria-hidden />
                Mobilier sur mesure
              </li>
              <li>
                <MdCheck size={16} aria-hidden />
                Luminaires &amp; volumes sculpturaux
              </li>
            </ul>
          </div>

          <form className="ae-col-form" onSubmit={submit}>
            <h3>Contactez le Bureau d’Études</h3>
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
              Type de projet
              <select
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
              >
                <option>Résidentiel</option>
                <option>Hospitalité</option>
                <option>Mobilier sur mesure</option>
                <option>Luminaire</option>
              </select>
            </label>
            <label>
              Message
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Décrivez brièvement votre projet"
              />
            </label>
            <button type="submit" className="ae-col-btn ae-col-btn-dark ae-col-submit">
              Nous contacter par e-mail
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
