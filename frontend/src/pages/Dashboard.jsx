// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CART_KEY = 'cart';
const ORDERS_KEY = 'orders';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ajout état pour les stats globales
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgCart: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des produits');
        setLoading(false);
      });
  }, []);

  // Récupérer les stats globales en temps réel
  useEffect(() => {
    setStatsLoading(true);
    axios.get('http://localhost:5000/api/stats')
      .then(res => {
        setStats(res.data);
        setStatsLoading(false);
      })
      .catch(err => {
        setStatsError('Erreur lors du chargement des statistiques');
        setStatsLoading(false);
      });
  }, []);

  // Sauvegarder le panier à chaque modification
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Métriques principales (remplacées par stats du back)
  // const totalRevenue = orders.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);
  // const totalOrders = orders.length;
  // const avgCart = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

  // Commandes récentes (5 dernières)
  const recentOrders = orders.slice(0, 5);

  // Graphique simulé
  const chartData = Array.from({ length: 12 }, (_, i) => 400 + Math.round(Math.random() * 300));

  // Recherche commandes
  const [search, setSearch] = useState('');
  const filteredOrders = recentOrders.filter(o =>
    !search || (o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())) || (o.client && o.client.toLowerCase().includes(search.toLowerCase())))
  );

  // --- Nouveau design ---
  return (
    <div style={{ background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', padding: '1rem 0 0 0',borderRadius: 10, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: '#222', marginBottom: 36, letterSpacing: 1 }}>Dashboard</h2>
        {/* Cartes métriques */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', borderRadius: 16, padding: 20, minWidth: 160, textAlign: 'center', boxShadow: '0 4px 18px #e0e0e0', flex: 1, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 15, color: '#e3f2fd', marginBottom: 4 }}>Chiffre d'affaires</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', margin: '6px 0' }}>{statsLoading ? '...' : (isNaN(stats.totalRevenue) ? '0.00' : stats.totalRevenue.toFixed(2))} €</div>
            <div style={{ fontSize: 11, color: '#e3f2fd' }}>(toutes commandes)</div>
          </div>
          <div style={{ background: 'linear-gradient(90deg, #f9a825 0%, #ffd54f 100%)', color: '#fff', borderRadius: 16, padding: 20, minWidth: 160, textAlign: 'center', boxShadow: '0 4px 18px #e0e0e0', flex: 1, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 15, color: '#fffde7', marginBottom: 4 }}>Nombre de commandes</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', margin: '6px 0' }}>{statsLoading ? '...' : stats.totalOrders}</div>
          </div>
          <div style={{ background: 'linear-gradient(90deg, #43a047 0%, #a5d6a7 100%)', color: '#fff', borderRadius: 16, padding: 20, minWidth: 160, textAlign: 'center', boxShadow: '0 4px 18px #e0e0e0', flex: 1, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 15, color: '#e8f5e9', marginBottom: 4 }}>Panier moyen</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', margin: '6px 0' }}>{statsLoading ? '...' : (isNaN(stats.avgCart) ? '0.00' : stats.avgCart.toFixed(2))} €</div>
          </div>
        </div>
        {statsError && <div style={{ color: '#e53935', marginBottom: 16 }}>{statsError}</div>}
        {/* Overview + Statistiques */}
        <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, flex: 2, minWidth: 340, marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1976d2', marginBottom: 0, letterSpacing: 0.5 }}>Overview</span>
            </div>
            <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 14, margin: '18px 0' }}>
              {chartData.map((v, i) => (
                <div key={i} style={{ width: 26, height: v / 4, background: 'linear-gradient(120deg, #1976d2 60%, #64b5f6 100%)', borderRadius: 8, marginBottom: 2, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Évolution des ventes sur 12 mois (simulation)</div>
          </section>
          {/* Commandes récentes */}
          <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #e0e0e0', padding: 32, flex: 3, minWidth: 340, marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1976d2', marginBottom: 0, letterSpacing: 0.5 }}>Commandes récentes</span>
              <input style={{ border: '1px solid #bbb', borderRadius: 8, padding: '8px 14px', fontSize: 17, outline: 'none', minWidth: 220, marginLeft: 12 }} placeholder="Recherche client ou produit" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px #ececec' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Client</th>
                    <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Produits</th>
                    <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Date</th>
                    <th style={{ background: '#f4f7fa', padding: 14, fontWeight: 800, color: '#1976d2', fontSize: 17, textAlign: 'left' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.id} style={idx % 2 === 1 ? { background: '#f8fafc' } : {}}>
                      <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.client || <span style={{ color: '#bbb' }}>-</span>}</td>
                      <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.items.map(i => `${i.name} x${i.quantity}`).join(' | ')}</td>
                      <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.date}</td>
                      <td style={{ padding: 13, fontSize: 16, color: '#222', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan={4} style={{ color: '#888', textAlign: 'center', padding: 28, fontSize: 16 }}>Aucune commande</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
