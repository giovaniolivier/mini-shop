import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productsApi';
import ProductTable from '../../components/ProductTable';
import ProductForm from '../../components/ProductForm';
import ProductChart from '../../components/ProductChart';

const CATEGORIES = ['Électronique', 'Livres', 'Vêtements', 'Maison', 'Sport', 'Autre'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', image_url: '', category: '', stock: 10, description: '' });
  const [editId, setEditId] = useState(null);
  const [categoryList, setCategoryList] = useState(CATEGORIES);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts();
      setProducts(res.data.map(p => ({ ...p, stock: p.stock ?? 10 })));
    } catch (err) {
      setError('Erreur lors du chargement des produits : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Ajout ou modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert('Nom et prix obligatoires');
    try {
      if (editId) {
        // Modification
        const res = await updateProduct(editId, {
          name: form.name,
          price: form.price,
          image_url: form.image_url,
          stock: Number(form.stock),
          description: form.description,
          category: form.category
        });
        setProducts(prev => prev.map(p => p.id === editId ? res.data : p));
        setEditId(null);
      } else {
        // Création
        const res = await createProduct({
          name: form.name,
          price: form.price,
          image_url: form.image_url,
          stock: Number(form.stock),
          description: form.description,
          category: form.category
        });
        setProducts(prev => [...prev, res.data]);
      }
      setForm({ name: '', price: '', image_url: '', category: '', stock: 10, description: '' });
    } catch (err) {
      alert('Erreur lors de la sauvegarde du produit : ' + (err.response?.data?.message || err.message));
    }
  };
  // Suppression
  const handleDelete = async (id) => {
    const prod = products.find(p => p.id === id);
    if (!window.confirm(`Voulez-vous vraiment supprimer le produit "${prod?.name || ''}" ? Cette action est irréversible.`)) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression : ' + (err.response?.data?.message || err.message));
    }
  };
  // Edition
  const handleEdit = (prod) => {
    setForm(prod);
    setEditId(prod.id);
  };
  // Gestion catégories
  const addCategory = (cat) => {
    if (!cat || categoryList.includes(cat)) return;
    setCategoryList(prev => [...prev, cat]);
  };
  // Import/export JSON
  const handleExport = () => {
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogue.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        alert('Fichier invalide');
      }
    };
    reader.readAsText(file);
  };
  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setForm(f => ({ ...f, image_url: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setForm(f => ({ ...f, image_url: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Styles Atelier Épure
  const stockStyle = (stock) => ({ color: stock < 5 ? 'var(--color-danger)' : 'var(--color-tertiary)', fontWeight: 700 });

  // Données pour le chart : nombre de produits par catégorie
  const chartData = categoryList.map(cat => ({
    category: cat,
    count: products.filter(p => p.category === cat).length
  }));

  // Seuil de stock critique
  const STOCK_CRITIQUE = 5;
  const produitsCritiques = products.filter(p => Number(p.stock) <= STOCK_CRITIQUE);

  return (
    <div className="ae-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="ae-page-title">Produits</h1>
      <p className="ae-page-sub">Catalogue Atelier Épure</p>
      {produitsCritiques.length > 0 && (
        <div className="surface" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(184,115,51,0.35)' }}>
          <strong style={{ color: 'var(--color-secondary)' }}>Stock critique :</strong>{' '}
          {produitsCritiques.map(p => p.name).join(', ')}
        </div>
      )}
      <section className="surface" style={{ padding: '1.35rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Produits par catégorie</h2>
        <ProductChart chartData={chartData} />
      </section>
      <section className="surface" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={handleExport}>Exporter JSON</button>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Importer
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </section>
      <ProductForm
        form={form}
        setForm={setForm}
        editId={editId}
        onSubmit={handleSubmit}
        onCancel={() => { setEditId(null); setForm({ name: '', price: '', image_url: '', category: '', stock: 10, description: '' }); }}
        categoryList={categoryList}
        dragActive={dragActive}
        setDragActive={setDragActive}
        handleImageDrop={handleImageDrop}
        handleImageSelect={handleImageSelect}
        addCategory={addCategory}
      />
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        stockStyle={stockStyle}
        loading={loading}
        error={error}
      />
    </div>
  );
} 