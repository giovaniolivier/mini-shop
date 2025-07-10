import React from 'react';

export default function ProductForm({ form, setForm, editId, onSubmit, onCancel, categoryList, dragActive, setDragActive, handleImageDrop, handleImageSelect, input, btn, section, addCategory }) {
  return (
    <section style={section}>
      <h2 style={{ fontSize: 26, color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>{editId ? 'Modifier' : 'Ajouter'} un produit</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 8 }}>
        <input style={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom" required />
        <input style={input} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Prix" required min="0" step="0.01" />
        {/* Champ image drag & drop uniquement, sans input texte */}
        <div
          style={{
            border: dragActive ? '2px solid #1976d2' : '2px dashed #bbb',
            borderRadius: 12,
            padding: '10px 14px',
            textAlign: 'center',
            background: dragActive ? '#e3f2fd' : '#fafbfc',
            margin: '0 8px 12px 0',
            minWidth: 180,
            minHeight: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            flex: 1
          }}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById('imageInput').click()}
        >
          {form.image_url ? (
            <img src={form.image_url} alt="aperçu" style={{ maxWidth: 38, maxHeight: 38, borderRadius: 8, marginBottom: 0 }} />
          ) : (
            <span style={{ color: '#888', fontSize: 15 }}>Glissez une image ici ou cliquez</span>
          )}
          <input id="imageInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
        </div>
        <select style={input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          <option value="">Catégorie</option>
          {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input style={input} type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="Stock" min="0" />
        <input style={input} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
        <button style={btn} type="submit">{editId ? 'Enregistrer' : 'Ajouter'}</button>
        {editId && <button style={{ ...btn, background: '#eee', color: '#222' }} onClick={onCancel}>Annuler</button>}
      </form>
      {/* Ajout catégorie */}
      <div style={{ marginTop: 12 }}>
        <input style={input} placeholder="Nouvelle catégorie" onKeyDown={e => { if (e.key === 'Enter') { addCategory(e.target.value); e.target.value = ''; } }} />
        <span style={{ color: '#888', fontSize: 14 }}>Entrée pour ajouter</span>
      </div>
    </section>
  );
} 