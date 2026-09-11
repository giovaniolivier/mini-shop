const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  const client = req.user.email;
  if (!client) return res.status(400).json({ message: 'Client requis' });
  try {
    let cart = await Order.findOne({
      where: { client, status: 'cart' },
      include: { model: OrderItem, as: 'items', include: Product },
    });
    if (!cart) {
      cart = await Order.create({ client, total: 0, status: 'cart' });
    }
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    cart = await Order.findByPk(cart.id, {
      include: {
        model: OrderItem,
        as: 'items',
        include: {
          model: Product,
          required: false,
        },
      },
    });
    if (cart && cart.items) {
      cart.items = cart.items.filter((item) => item.Product);
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const client = req.user.email;
  if (!client || !productId || !quantity) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }
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
      item = await OrderItem.create({
        OrderId: cart.id,
        ProductId: productId,
        quantity,
        price: product.price,
      });
    }
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json(await Order.findByPk(cart.id, { include: { model: OrderItem, as: 'items', include: Product } }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const client = req.user.email;
  if (!client || !productId) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' } });
    if (!cart) return res.status(404).json({ message: 'Panier introuvable' });
    await OrderItem.destroy({ where: { OrderId: cart.id, ProductId: productId } });
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
  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }
  const client = req.user.email;
  try {
    let cart = await Order.findOne({ where: { client, status: 'cart' } });
    if (!cart) return res.status(404).json({ message: 'Panier introuvable' });
    let item = await OrderItem.findOne({ where: { OrderId: cart.id, ProductId: productId } });
    if (!item) return res.status(404).json({ message: 'Produit non présent dans le panier' });
    item.quantity = quantity;
    await item.save();
    const items = await OrderItem.findAll({ where: { OrderId: cart.id } });
    cart.total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.json(await Order.findByPk(cart.id, { include: { model: OrderItem, as: 'items', include: Product } }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  const client = req.user.email;
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
