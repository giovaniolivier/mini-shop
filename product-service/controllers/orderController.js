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
        console.log('Stock check:', { productId, stock: product ? product.stock : null, quantity: item.quantity });
        if (!product || product.stock < item.quantity) throw new Error('Stock insuffisant pour ' + (product?.name || 'ID ' + productId));
        await OrderItem.create({
          OrderId: order.id,
          ProductId: productId,
          quantity: item.quantity,
          price: product.price,
        }, { transaction: t });
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

// Récupérer l'historique des commandes
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ include: { model: OrderItem, as: 'items', include: Product }, order: [['date', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PANIER (CART)
exports.getCart = async (req, res) => {
  // const client = req.query.client;
  const client = req.user.email;
  console.log('getCart client:', client);
  if (!client) return res.status(400).json({ message: 'Client requis' });
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' }, include: { model: OrderItem, as: 'items', include: Product } });
    if (!cart) {
      cart = await Order.create({ client, total: 0, status: 'cart' });
    }
    // AJOUT : recalculer le total à chaque lecture
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    // On recharge le panier avec les items et produits inclus
    cart = await Order.findByPk(cart.id, {
      include: {
        model: OrderItem,
        as: 'items',
        include: {
          model: Product,
          required: false // Inclut les items même si le produit n'existe plus
        }
      }
    });
    // Filtrer les items dont le produit existe
    if (cart && cart.items) {
      cart.items = cart.items.filter(item => item.Product);
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  // const { client, productId, quantity } = req.body;
  const { productId, quantity } = req.body;
  const client = req.user.email;
  console.log('addToCart client:', client);
  if (!client || !productId || !quantity) return res.status(400).json({ message: 'Champs requis manquants' });
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' } });
    if (!cart) cart = await Order.create({ client, total: 0, status: 'cart' });
    let item = await OrderItem.findOne({ where: { OrderId: cart.id, ProductId: productId } });
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await OrderItem.create({ OrderId: cart.id, ProductId: productId, quantity, price: product.price });
    }
    // Recalculer le total
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json(await Order.findByPk(cart.id, { include: { model: OrderItem, as: 'items', include: Product } }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  console.log('removeFromCart:', { user: req.user, body: req.body });
  const { productId } = req.body;
  const client = req.user.email;
  console.log('removeFromCart client:', client);
  if (!client || !productId) return res.status(400).json({ message: 'Champs requis manquants' });
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' } });
    if (!cart) return res.status(404).json({ message: 'Panier introuvable' });
    await OrderItem.destroy({ where: { OrderId: cart.id, ProductId: productId } });
    // Recalculer le total
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json(await Order.findByPk(cart.id, { include: { model: OrderItem, as: 'items', include: Product } }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) return res.status(400).json({ message: 'Champs requis manquants' });
  const client = req.user.email;
  console.log('updateCartItem client:', client);
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' } });
    if (!cart) return res.status(404).json({ message: 'Panier introuvable' });
    let item = await OrderItem.findOne({ where: { OrderId: cart.id, ProductId: productId } });
    if (!item) return res.status(404).json({ message: 'Produit non présent dans le panier' });
    item.quantity = quantity;
    await item.save();
    // Recalculer le total
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json(await Order.findByPk(cart.id, { include: { model: OrderItem, as: 'items', include: Product } }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  // Correction : utiliser l'utilisateur authentifié
  const client = req.user.email;
  console.log('clearCart client:', client);
  if (!client) return res.status(400).json({ message: 'Client requis' });
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' } });
    if (!cart) return res.status(404).json({ message: 'Panier introuvable' });
    await OrderItem.destroy({ where: { OrderId: cart.id } });
    cart.total = 0;
    await cart.save();
    res.json(await Order.findByPk(cart.id, { include: { model: OrderItem, as: 'items', include: Product } }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Statistiques globales
exports.getStats = async (req, res) => {
  try {
    // On ne compte que les commandes validées (pas les paniers en cours)
    const orders = await Order.findAll({ where: { status: { [Op.ne]: 'cart' } } });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgCart = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      avgCart: Number(avgCart.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClientOrders = async (req, res) => {
  try {
    const email = req.user.email;
    console.log('getClientOrders - email utilisé :', email);
    const orders = await Order.findAll({
      where: {
        client: email,
        [Op.and]: [
          sequelize.where(
            sequelize.fn('lower', sequelize.col('status')),
            { [Op.ne]: 'cart' }
          )
        ]
      },
      include: { model: OrderItem, as: 'items', include: Product },
      order: [['date', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 