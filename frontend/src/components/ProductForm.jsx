import React from 'react';

export default function ProductForm({
  form,
  setForm,
  editId,
  onSubmit,
  onCancel,
  categoryList,
  dragActive,
  setDragActive,
  handleImageDrop,
  handleImageSelect,
  addCategory,
}) {
  return (
    <section className="surface" style={{ padding: '1.35rem', margin: '1.25rem 0' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>{editId ? 'Modifier' : 'Ajouter'} un produit</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input
          className="input"
          style={{ flex: '1 1 140px' }}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nom"
          required
        />
        <input
          className="input"
          style={{ width: 110 }}
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Prix"
          required
          min="0"
          step="0.01"
        />
        <div
          style={{
            border: dragActive ? '2px solid var(--color-secondary)' : '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            textAlign: 'center',
            background: dragActive ? 'rgba(184,115,51,0.08)' : 'var(--color-neutral)',
            minWidth: 180,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flex: 1,
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById('imageInput').click()}
        >
          {form.image_url ? (
            <img src={form.image_url} alt="aperçu" style={{ maxWidth: 38, maxHeight: 38, borderRadius: 8 }} />
          ) : (
            <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>Image — glisser ou cliquer</span>
          )}
          <input id="imageInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
        </div>
        <select
          className="input"
          style={{ width: 150 }}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="">Catégorie</option>
          {categoryList.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          className="input"
          style={{ width: 90 }}
          type="number"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          placeholder="Stock"
          min="0"
        />
        <input
          className="input"
          style={{ flex: '1 1 160px' }}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description"
        />
        <button className="btn btn-primary" type="submit">
          {editId ? 'Enregistrer' : 'Ajouter'}
        </button>
        {editId && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
        )}
      </form>
      <div style={{ marginTop: 12 }}>
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Nouvelle catégorie (Entrée)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCategory(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </div>
    </section>
  );
}
