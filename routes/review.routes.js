const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Ajouter un avis
router.post('/', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { supplierId, rating, comment } = req.body;

  if (!supplierId || !rating) {
    return res.status(400).json({ message: "supplierId et rating sont obligatoires." });
  }

  const sql = `INSERT INTO Review (userId, supplierId, rating, comment) VALUES (?, ?, ?, ?)`;

  db.query(sql, [userId, supplierId, rating, comment || ''], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Avis ajouté avec succès." });
  });
});

// Lister les avis d’un fournisseur
router.get('/supplier/:supplierId', (req, res) => {
  const supplierId = req.params.supplierId;

  const sql = `SELECT r.*, u.username FROM Review r JOIN user u ON r.userId = u.userId WHERE r.supplierId = ? ORDER BY creationDate DESC`;

  db.query(sql, [supplierId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
