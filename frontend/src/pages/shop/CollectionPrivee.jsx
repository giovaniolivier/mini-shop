import { useMemo, useState } from 'react';
import {
  MdAddShoppingCart,
  MdCalendarMonth,
  MdClose,
  MdCloudDone,
  MdDownload,
  MdFolderOpen,
  MdIosShare,
  MdLocalMall,
  MdTexture,
  MdViewInAr,
  MdWorkspacePremium,
} from 'react-icons/md';
import {
  PRIVATE_COLLECTION,
  PRIVATE_PROJECTS,
  PRIVATE_STATS,
} from '../../data/collectionPriveeDemo';
import '../../styles/collectionPrivee.css';

function formatEuro(v) {
  return `${Number(v || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  })} €`;
}

export default function CollectionPrivee({ addToCart }) {
  const [items, setItems] = useState(PRIVATE_COLLECTION);
  const [tab, setTab] = useState('all');
  const [projects, setProjects] = useState(() =>
    Object.fromEntries(PRIVATE_COLLECTION.map((p) => [p.id, p.projectLabel]))
  );
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    if (tab === 'all') return items;
    if (tab === 'editions') return items.filter((p) => p.edition);
    return items.filter((p) => p.projectId === tab);
  }, [items, tab]);

  const tabCounts = useMemo(() => {
    const map = { all: items.length, marais: 0, capferret: 0, editions: 0 };
    items.forEach((p) => {
      if (p.projectId === 'marais') map.marais += 1;
      if (p.projectId === 'capferret') map.capferret += 1;
      if (p.edition) map.editions += 1;
    });
    return map;
  }, [items]);

  const estimation = useMemo(
    () => items.reduce((s, p) => s + Number(p.price || 0), 0),
    [items]
  );

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    flash('Pièce retirée de la collection');
  };

  const addOne = (product) => {
    addToCart?.({
      ...product,
      _demo: true,
      id: product.id,
    });
    flash(`${product.name} ajouté au panier`);
  };

  const transferAll = () => {
    filtered.forEach((p) => {
      if (p.action === 'cart') {
        addToCart?.({ ...p, _demo: true });
      }
    });
    flash('Sélection transférée au panier');
  };

  return (
    <div className="ae-priv">
      <div className="ae-priv-inner">
        <div className="ae-priv-top">
          <p className="ae-priv-crumb">
            Atelier Épure <span>/ Collection privée / Espace prescripteur</span>
          </p>
          <span className="ae-priv-sync">
            <MdCloudDone size={14} aria-hidden />
            Synchronisation nuage activée
          </span>
        </div>

        <header className="ae-priv-hero">
          <div className="ae-priv-hero-copy">
            <p className="ae-priv-kicker">Curation personnelle</p>
            <h1>Collection Privée &amp; Projets</h1>
            <p>
              Retrouvez vos pièces sauvegardées, composez vos planches d’aménagement et recevez
              les alertes prioritaires sur les tirages numérotés et créations d’exception.
            </p>
          </div>
          <div className="ae-priv-stats">
            <div>
              <span>Sélection</span>
              <strong>
                {items.length} <em>œuvres</em>
              </strong>
            </div>
            <div>
              <span>Partages</span>
              <strong>
                {PRIVATE_STATS.partages} <em>dossier</em>
              </strong>
            </div>
            <div>
              <span>Estimation</span>
              <strong className="ae-priv-est">{formatEuro(estimation || PRIVATE_STATS.estimation)}</strong>
            </div>
          </div>
        </header>

        {toast && <div className="ae-priv-toast">{toast}</div>}

        <section className="ae-priv-panel">
          <div className="ae-priv-tabs">
            {PRIVATE_PROJECTS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`ae-priv-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label} ({tabCounts[t.id] ?? t.count})
              </button>
            ))}
          </div>
          <div className="ae-priv-actions">
            <button type="button" className="ae-priv-btn" onClick={() => flash('Lien privé copié')}>
              <MdIosShare size={16} aria-hidden />
              Partager (lien privé)
            </button>
            <button type="button" className="ae-priv-btn" onClick={() => flash('Dossier PDF généré')}>
              <MdFolderOpen size={16} aria-hidden />
              Dossier PDF Pro
            </button>
            <button type="button" className="ae-priv-btn ae-priv-btn--gold" onClick={transferAll}>
              <MdLocalMall size={16} aria-hidden />
              Tout transférer au panier
            </button>
          </div>
        </section>

        <div className="ae-priv-grid">
          {filtered.map((p) => (
            <article key={p.id} className="ae-priv-card">
              <div className="ae-priv-media">
                <img src={p.image_url} alt={p.name} loading="lazy" />
                <div className="ae-priv-tags">
                  {p.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className={`ae-priv-tag${tag.tone === 'gold' ? ' ae-priv-tag--gold' : ''}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="ae-priv-remove"
                  aria-label="Retirer"
                  onClick={() => removeItem(p.id)}
                >
                  <MdClose size={16} />
                </button>
              </div>

              <div className="ae-priv-body">
                <h3>{p.name}</h3>
                <div className="ae-priv-price">{formatEuro(p.price)}</div>
                <p className={`ae-priv-status ae-priv-status--${p.status}`}>
                  {p.statusText}
                </p>
                <p className="ae-priv-dossier">Dossier de prescription</p>
                <select
                  className="ae-priv-select"
                  value={projects[p.id]}
                  onChange={(e) =>
                    setProjects((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  aria-label="Projet"
                >
                  <option>Appartement Marais</option>
                  <option>Villa Cap Ferret</option>
                  <option>Éditions numérotées</option>
                </select>
                {p.action === 'sample' ? (
                  <button
                    type="button"
                    className="ae-priv-cta ae-priv-cta--ghost"
                    onClick={() => flash('Demande d’échantillon envoyée')}
                  >
                    <MdTexture size={16} aria-hidden />
                    Demander un échantillon
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ae-priv-cta"
                    onClick={() => addOne(p)}
                  >
                    <MdAddShoppingCart size={16} aria-hidden />
                    Ajouter au panier
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {!filtered.length && (
          <p className="ae-priv-empty">Aucune pièce dans cette sélection.</p>
        )}

        <section className="ae-priv-service">
          <div className="ae-priv-service-copy">
            <span className="ae-priv-badge">
              <MdWorkspacePremium size={14} aria-hidden />
              Atelier prescription &amp; bureau d’études
            </span>
            <h2>Conseil Sur-Mesure &amp; Service Architecte</h2>
            <p>
              Cotations sur dimensions hors standard, adaptations d’essences et modélisations
              matières livrées sous 48 h pour vos dossiers de consultation.
            </p>
            <div className="ae-priv-advantage">
              <strong>✦ Avantage Prescripteur Actif</strong>
              <span>
                -15 % automatisé pour les architectes d’intérieur sur les projets sauvegardés.
              </span>
            </div>
            <div className="ae-priv-service-btns">
              <button
                type="button"
                className="ae-priv-cta"
                onClick={() => flash('Demande de RDV enregistrée')}
              >
                <MdCalendarMonth size={16} aria-hidden />
                Prendre RDV showroom privé
              </button>
              <button
                type="button"
                className="ae-priv-cta ae-priv-cta--ghost"
                onClick={() => flash('Téléchargement BIM / CAD')}
              >
                <MdDownload size={16} aria-hidden />
                Télécharger les fichiers 3D (BIM / CAD)
              </button>
            </div>
          </div>

          <div className="ae-priv-service-media">
            <div className="ae-priv-photo">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&h=700&fit=crop"
                alt="Bureau d’études et planches matières"
              />
              <div className="ae-priv-formats">
                <div>
                  <span>Formats disponibles</span>
                  <strong>Revit • Rhino 3D • SketchUp • IFC</strong>
                </div>
                <MdViewInAr size={20} aria-hidden />
              </div>
            </div>
            <div className="ae-priv-kit">
              <MdLocalMall size={20} aria-hidden />
              <div>
                <strong>Mallette Matériauthèque Épure</strong>
                <span>Livraison sous 24h par coursier sur simple demande.</span>
              </div>
              <button type="button" onClick={() => flash('Mallette commandée')}>
                Commander
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
