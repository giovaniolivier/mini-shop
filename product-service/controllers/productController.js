const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const { name, price, image_url, stock, description, category } = req.body;
    const product = await Product.create({ name, price, image_url, stock, description, category });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image_url, stock, description, category } = req.body;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.image_url = image_url ?? product.image_url;
    product.stock = stock ?? product.stock;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    await product.destroy();
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Décrémenter le stock lors d'un achat
exports.decrementStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Stock insuffisant' });
    product.stock -= quantity;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
