const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });
OrderItem.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(OrderItem, { foreignKey: 'ProductId' });

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
};
