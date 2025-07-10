const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const Product = require('./models/Product');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);

const PORT = process.env.PORT || 5000;

// Préparation pour l'import du middleware d'authentification et de rôle
// const { authenticateJWT, isAdmin } = require('./middleware/auth');

sequelize.sync({ alter: true }) // alter: true = adapte la BDD sans tout supprimer
  .then(() => {
    console.log('✅ Connexion à MySQL réussie');
    app.listen(PORT, () => console.log(`✅ API démarrée sur le port ${PORT}`));
  })
  .catch(err => console.error('❌ Erreur de connexion à MySQL:', err));
