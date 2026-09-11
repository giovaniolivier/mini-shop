import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCloudUpload, MdSave } from 'react-icons/md';
import { createProduct } from '../../services/productsApi';
import '../../styles/catalog.css';

const CATEGORIES = [
  "Assises d'Atelier",
  'Luminaires',
  'Mobilier',
  'Objets & Décoration',
  'Textiles Laine & Lin',
  'Électronique',
  'Livres',
  'Maison',
  'Sport',
  'Autre',
];

const emptyForm = {
  name: '',
  price: '',
  stock: 10,
  category: '',
  description: '',
  image_url: '',
};

export default function AdminProductNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(CATEGORIES);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const previewOk = useMemo(() => Boolean(form.image_url), [form.image_url]);

  const readImage = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Fichier image invalide (JPG, PNG, WEBP…).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => setField('image_url', evt.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    readImage(e.dataTransfer?.files?.[0]);
  };

  const addCategory = () => {
    const cat = customCategory.trim();
    if (!cat) return;
    if (!categories.includes(cat)) setCategories((prev) => [...prev, cat]);
    setField('category', cat);
    setCustomCategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || form.price === '' || form.price === null) {
      setError('Le nom et le prix sont obligatoires.');
      return;
    }
    if (Number(form.price) < 0) {
      setError('Le prix doit être positif.');
      return;
    }
    if (Number(form.stock) < 0) {
      setError('Le stock ne peut pas être négatif.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        category: form.category || null,
        description: form.description.trim() || null,
        image_url: form.image_url || null,
      };

      const created = await createProduct(payload);
      setSuccess(`Produit « ${created.data.name} » créé (SKU EP-${String(created.data.id).padStart(4, '0')}).`);
      setTimeout(() => navigate('/admin/products'), 900);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ae-cat ae-prod-form-page">
      <div className="ae-cat-crumb">
        Administration boutique <span className="accent">/ Inventaire &amp; flux</span>
      </div>

      <div className="ae-cat-head">
        <div>
          <Link to="/admin/products" className="ae-prod-back">
            <MdArrowBack size={16} /> Retour catalogue
          </Link>
          <h1>Nouveau produit</h1>
          <p className="ae-prod-sub">
            Champs alignés sur le modèle produit : nom, prix, stock, catégorie, description, image.
          </p>
        </div>
      </div>

      {error && <div className="ae-dash-error">{error}</div>}
      {success && <div className="ae-prod-success">{success}</div>}

      <form className="ae-prod-form" onSubmit={handleSubmit}>
        <section className="ae-prod-card">
          <h2>Informations générales</h2>
          <div className="ae-prod-grid">
            <label className="ae-prod-field ae-prod-field--full">
              <span>Nom du produit *</span>
              <input
                className="ae-prod-input"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ex. Fauteuil Épure Chêne"
                required
              />
            </label>

            <label className="ae-prod-field">
              <span>Prix HT (€) *</span>
              <input
                className="ae-prod-input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                placeholder="1480"
                required
              />
            </label>

            <label className="ae-prod-field">
              <span>Stock *</span>
              <input
                className="ae-prod-input"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setField('stock', e.target.value)}
                placeholder="10"
                required
              />
            </label>

            <label className="ae-prod-field">
              <span>Catégorie</span>
              <select
                className="ae-prod-input"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              >
                <option value="">Sélectionner…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="ae-prod-field">
              <span>Nouvelle catégorie</span>
              <div className="ae-prod-inline">
                <input
                  className="ae-prod-input"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ex. Céramique"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCategory();
                    }
                  }}
                />
                <button type="button" className="ae-cat-btn" onClick={addCategory}>
                  Ajouter
                </button>
              </div>
            </div>

            <label className="ae-prod-field ae-prod-field--full">
              <span>Description</span>
              <textarea
                className="ae-prod-input ae-prod-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Matière, finition, dimensions, usage…"
              />
            </label>
          </div>
        </section>

        <section className="ae-prod-card">
          <h2>Visuel</h2>
          <div
            className={`ae-prod-drop${dragActive ? ' active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('ae-prod-file').click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') document.getElementById('ae-prod-file').click();
            }}
          >
            {previewOk ? (
              <img src={form.image_url} alt="Aperçu produit" />
            ) : (
              <>
                <MdCloudUpload size={28} />
                <p>Glisser une image ici ou cliquer pour parcourir</p>
                <span>Champ API : image_url</span>
              </>
            )}
            <input
              id="ae-prod-file"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => readImage(e.target.files?.[0])}
            />
          </div>
          <label className="ae-prod-field ae-prod-field--full" style={{ marginTop: '0.85rem' }}>
            <span>URL image (optionnel)</span>
            <input
              className="ae-prod-input"
              value={form.image_url.startsWith('data:') ? '' : form.image_url}
              onChange={(e) => setField('image_url', e.target.value)}
              placeholder="https://…"
            />
          </label>
          {previewOk && (
            <button
              type="button"
              className="ae-cat-btn"
              style={{ marginTop: 8 }}
              onClick={() => setField('image_url', '')}
            >
              Retirer l’image
            </button>
          )}
        </section>

        <section className="ae-prod-card ae-prod-summary">
          <h2>Récapitulatif</h2>
          <ul>
            <li>
              <strong>name</strong> — {form.name || '—'}
            </li>
            <li>
              <strong>price</strong> — {form.price !== '' ? `${form.price} €` : '—'}
            </li>
            <li>
              <strong>stock</strong> — {form.stock}
            </li>
            <li>
              <strong>category</strong> — {form.category || '—'}
            </li>
            <li>
              <strong>description</strong> — {form.description || '—'}
            </li>
            <li>
              <strong>image_url</strong> — {form.image_url ? 'renseigné' : '—'}
            </li>
          </ul>
        </section>

        <div className="ae-prod-actions">
          <Link to="/admin/products" className="ae-cat-btn">
            Annuler
          </Link>
          <button type="submit" className="ae-cat-btn primary" disabled={loading}>
            <MdSave size={16} />
            {loading ? 'Création…' : 'Enregistrer le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
