require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const sequelize = require('../config/db');
const User = require('../models/User');

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@mail.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Un utilisateur avec cet email existe déjà:', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
      role: 'admin',
    });

    console.log('Admin créé:', { id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    console.error('Erreur création admin:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
