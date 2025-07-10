import React, { useEffect, useState } from 'react';
import { getOrders, updateOrder } from '../services/api';
import OrderTable from '../components/OrderTable';

const STATUS = ['À valider', 'Préparation', 'Expédiée', 'Livrée', 'Retournée', 'Remboursée'];

function getNextStatus(current) {
  const idx = STATUS.indexOf(current);
  if (idx < STATUS.length - 3) return STATUS[idx + 1];
  if (current === 'Livrée') return 'Retournée';
  return current;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des commandes : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Changer le statut
  const changeStatus = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const next = getNextStatus(order.status);
    try {
      const res = await updateOrder(id, { status: next });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next, history: [...(o.history || []), { status: next, date: new Date().toLocaleString() }] } : o));
    } catch (err) {
      setError('Erreur lors du changement de statut : ' + (err.response?.data?.message || err.message));
    }
  };

  // Marquer comme remboursée
  const refund = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    if (!window.confirm(`Voulez-vous vraiment rembourser la commande du ${order?.date || ''} ? Cette action est irréversible.`)) return;
    try {
      const res = await updateOrder(id, { status: 'Remboursée', refunded: true });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Remboursée', refunded: true, history: [...(o.history || []), { status: 'Remboursée', date: new Date().toLocaleString() }] } : o));
    } catch (err) {
      setError('Erreur lors du remboursement : ' + (err.response?.data?.message || err.message));
    }
  };

  // Impression
  const printOrder = (order) => {
    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<html><head><title>Bon de livraison</title></head><body>');
    win.document.write(`<h2>Bon de livraison - Commande du ${order.date}</h2>`);
    win.document.write('<ul>');
    order.items.forEach(item => {
      win.document.write(`<li>${item.name} - ${item.price} € x ${item.quantity}</li>`);
    });
    win.document.write('</ul>');
    win.document.write(`<p><b>Statut :</b> ${order.status}</p>`);
    win.document.write('</body></html>');
    win.print();
    win.close();
  };

  // Styles
  const btn = { background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 8px', boxShadow: '0 2px 8px #e0e0e0', transition: 'background 0.2s' };
  const btnSec = { ...btn, background: '#eee', color: '#222' };

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', minHeight: '100vh', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1976d2', marginBottom: 36, letterSpacing: 1, textAlign: 'center' }}>Gestion des commandes</h1>
      <OrderTable
        orders={orders}
        onChangeStatus={changeStatus}
        onRefund={refund}
        onPrint={printOrder}
        loading={loading}
        error={error}
        btn={btn}
        btnSec={btnSec}
      />
    </div>
  );
} 