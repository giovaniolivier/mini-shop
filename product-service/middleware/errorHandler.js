function notFoundHandler(req, res, next) {
  res.status(404).json({ message: `Route introuvable: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erreur serveur';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
