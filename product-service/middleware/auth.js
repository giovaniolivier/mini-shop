const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware pour vérifier le JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    console.log('JWT user:', user); // AJOUT DEBUG
    req.user = user;
    next();
  });
}

// Middleware pour vérifier le rôle admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
}

module.exports = { authenticateJWT, isAdmin }; 