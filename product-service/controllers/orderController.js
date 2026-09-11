const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

exports.createOrder = async (req, res) => {
  const { items } = req.body;
  const client = req.user.email;
  let total = 0;
  try {
    await sequelize.transaction(async (t) => {
      const order = await Order.create({ client, total: 0, status: 'Validée' }, { transaction: t });
      for (const item of items) {
        const productId = item.ProductId || item.productId;
        const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!product || product.stock < item.quantity) {
          throw new Error('Stock insuffisant pour ' + (product?.name || 'ID ' + productId));
        }
        await OrderItem.create(
          {
            OrderId: order.id,
            ProductId: productId,
            quantity: item.quantity,
            price: product.price,
          },
          { transaction: t }
        );
        product.stock -= item.quantity;
        await product.save({ transaction: t });
        total += product.price * item.quantity;
      }
      order.total = total;
      await order.save({ transaction: t });
      res.status(201).json(order);
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/** Création manuelle admin : client, statut, date, lignes produit */
exports.createManualOrder = async (req, res) => {
  const { items, client, status, date } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Au moins un article est requis' });
  }
  const clientLabel = String(client || '').trim();
  if (!clientLabel) {
    return res.status(400).json({ message: 'Le client est obligatoire' });
  }

  const allowed = [
    'Validée',
    'En préparation',
    'Préparation',
    'Expédiée',
    'Livrée',
    'Retour / Litige',
    'Annulée',
  ];
  const orderStatus = allowed.includes(status) ? status : 'En préparation';
  const orderDate = date ? new Date(date) : new Date();
  if (Number.isNaN(orderDate.getTime())) {
    return res.status(400).json({ message: 'Date invalide' });
  }

  let total = 0;
  try {
    await sequelize.transaction(async (t) => {
      const order = await Order.create(
        { client: clientLabel, total: 0, status: orderStatus, date: orderDate },
        { transaction: t }
      );
      for (const item of items) {
        const productId = item.ProductId || item.productId;
        const qty = Number(item.quantity) || 0;
        if (!productId || qty < 1) {
          throw new Error('Chaque ligne doit avoir un produit et une quantité ≥ 1');
        }
        const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!product) {
          throw new Error('Produit introuvable (ID ' + productId + ')');
        }
        if (product.stock < qty) {
          throw new Error('Stock insuffisant pour ' + product.name);
        }
        await OrderItem.create(
          {
            OrderId: order.id,
            ProductId: productId,
            quantity: qty,
            price: product.price,
          },
          { transaction: t }
        );
        product.stock -= qty;
        await product.save({ transaction: t });
        total += product.price * qty;
      }
      order.total = total;
      await order.save({ transaction: t });
      const full = await Order.findByPk(order.id, {
        include: { model: OrderItem, as: 'items', include: Product },
        transaction: t,
      });
      res.status(201).json(full);
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: { model: OrderItem, as: 'items', include: Product },
      order: [['date', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: { model: OrderItem, as: 'items', include: Product },
    });
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    const { status } = req.body;
    if (status) order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [paidOrders, cartOrders, products] = await Promise.all([
      Order.findAll({
        where: { status: { [Op.ne]: 'cart' } },
        include: { model: OrderItem, as: 'items', include: Product },
        order: [['date', 'ASC']],
      }),
      Order.findAll({ where: { status: 'cart' } }),
      Product.findAll(),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = paidOrders.length;
    const avgCart = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueClients = new Set(paidOrders.map((o) => o.client).filter(Boolean)).size;
    const conversionDenom = totalOrders + cartOrders.length;
    const conversionRate =
      conversionDenom > 0 ? Number(((totalOrders / conversionDenom) * 100).toFixed(2)) : 0;

    const categoryMap = {};
    const productQty = {};
    for (const order of paidOrders) {
      for (const item of order.items || []) {
        const cat = item.Product?.category || 'Non classé';
        const line = (item.price || 0) * (item.quantity || 0);
        categoryMap[cat] = (categoryMap[cat] || 0) + line;
        const pid = item.ProductId || item.Product?.id;
        if (pid) {
          if (!productQty[pid]) {
            productQty[pid] = {
              id: pid,
              name: item.Product?.name || `Produit #${pid}`,
              quantity: 0,
              image_url: item.Product?.image_url || null,
            };
          }
          productQty[pid].quantity += item.quantity || 0;
        }
      }
    }

    const categoryTotal = Object.values(categoryMap).reduce((s, v) => s + v, 0) || 1;
    const revenueByCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
        percent: Number(((amount / categoryTotal) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthMap = {};
    for (const order of paidOrders) {
      const d = new Date(order.date || order.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + (order.total || 0);
    }
    const monthlyRevenue = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month,
        revenue: Number(revenue.toFixed(2)),
      }));

    const lowStockProducts = products
      .filter((p) => (p.stock ?? 0) <= 3)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock ?? 0,
        image_url: p.image_url,
        category: p.category,
      }))
      .sort((a, b) => a.stock - b.stock);

    const bestseller = Object.values(productQty).sort((a, b) => b.quantity - a.quantity)[0] || null;

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      avgCart: Number(avgCart.toFixed(2)),
      uniqueClients,
      conversionRate,
      cartCount: cartOrders.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      revenueByCategory,
      monthlyRevenue,
      bestseller,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClientOrders = async (req, res) => {
  try {
    const email = req.user.email;
    const orders = await Order.findAll({
      where: {
        client: email,
        [Op.and]: [
          sequelize.where(sequelize.fn('lower', sequelize.col('status')), {
            [Op.ne]: 'cart',
          }),
        ],
      },
      include: { model: OrderItem, as: 'items', include: Product },
      order: [['date', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
