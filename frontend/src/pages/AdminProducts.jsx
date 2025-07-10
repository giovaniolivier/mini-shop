import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import ProductChart from '../components/ProductChart';

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

  // Styles
  const section = { background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0' };
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0', transition: 'background 0.2s' };
  const input = { border: '1px solid #bbb', borderRadius: 8, padding: '10px 14px', fontSize: 16, outline: 'none', margin: '0 8px 12px 0', background: '#f8fafc' };
  const stockStyle = (stock) => ({ color: stock < 5 ? '#e53935' : '#388e3c', fontWeight: 700 });

  // Données pour le chart : nombre de produits par catégorie
  const chartData = categoryList.map(cat => ({
    category: cat,
    count: products.filter(p => p.category === cat).length
  }));

  // Seuil de stock critique
  const STOCK_CRITIQUE = 5;
  const produitsCritiques = products.filter(p => Number(p.stock) <= STOCK_CRITIQUE);

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Gestion des produits</h1>
      {/* Alerte stock critique */}
      {produitsCritiques.length > 0 && (
        <div style={{ background: '#fff3e0', border: '1px solid #ff9800', color: '#e65100', borderRadius: 12, padding: '18px 28px', margin: '0 auto 32px auto', maxWidth: 700, boxShadow: '0 2px 12px #ffe0b2', fontWeight: 600, fontSize: 17, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 22, marginRight: 10 }}>⚠️</span>
          <span>Attention, stock critique pour&nbsp;</span>
          <span style={{ fontWeight: 800, color: '#d84315' }}>{produitsCritiques.map(p => p.name).join(', ')}</span>
        </div>
      )}
      {/* Chart moderne simplifié */}
      <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, margin: '32px 0', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, color: '#1976d2', fontWeight: 800, marginBottom: 24, textAlign: 'center', letterSpacing: 0.5 }}>Produits par catégorie</h2>
        <ProductChart chartData={chartData} />
      </section>
      {/* Import/export */}
      <section style={section}>
        <button style={btn} onClick={handleExport}>Exporter catalogue JSON</button>
        <label style={{ ...btn, background: '#eee', color: '#1976d2', cursor: 'pointer' }}>
          Importer catalogue
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </section>
      {/* Formulaire produit */}
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
        input={input}
        btn={btn}
        section={section}
        addCategory={addCategory}
      />
      {/* Liste produits sous forme de tableau */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        stockStyle={stockStyle}
        btn={btn}
        loading={loading}
        error={error}
      />
    </div>
  );
} 