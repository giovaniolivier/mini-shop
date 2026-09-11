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

exports.getStats = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { status: { [Op.ne]: 'cart' } } });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgCart = totalOrders > 0 ? totalRevenue / totalOrders : 0;
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
