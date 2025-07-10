const sequelize = require('../config/db');
const Order = require('../models/Order');

(async () => {
  try {
    await sequelize.authenticate();
    const orders = await Order.findAll({ attributes: ['id', 'client', 'status', 'date'], order: [['date', 'DESC']] });
    if (!orders.length) {
      console.log('Aucune commande trouvée.');
    } else {
      console.log('Commandes :');
      orders.forEach(o => {
        console.log(`ID: ${o.id}, Client: ${o.client}, Status: ${o.status}, Date: ${o.date}`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la lecture des commandes :', err);
    process.exit(1);
  }
})(); 