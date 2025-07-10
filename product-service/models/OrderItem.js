const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

Order.hasMany(OrderItem, { as: 'items' });
OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

module.exports = OrderItem; 