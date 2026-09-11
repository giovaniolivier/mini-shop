const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sanitizeUser(user) {
  const plain = user.get ? user.get({ plain: true }) : { ...user };
  delete plain.password;
  return plain;
}

exports.register = async (req, res, next) => {
  const {
    username,
    firstName,
    lastName,
    phone,
    email,
    password,
    newsletter,
    sampleKit,
  } = req.body;
  try {
    const resolvedName =
      username ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      (email ? email.split('@')[0] : '');

    if (!resolvedName || !email || !password) {
      return res.status(400).json({
        message: 'Prénom/nom (ou username), email et mot de passe sont requis',
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: resolvedName,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      email,
      password: hashed,
      role: 'client',
      newsletter: Boolean(newsletter),
      sampleKit: Boolean(sampleKit),
    });
    res.status(201).json({ message: 'Utilisateur créé', user: sanitizeUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'email et password sont requis' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      role: user.role,
      expiresIn,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Réponse générique (pas d'énumération d'emails). Reset réel = email service hors scope. */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'email requis' });
    }
    await User.findOne({ where: { email } });
    res.json({
      message:
        'Si un compte est associé à cet email, les instructions de réinitialisation ont été envoyées.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
