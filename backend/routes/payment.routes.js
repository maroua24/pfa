const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Simuler un paiement
router.post('/', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ message: "orderId et amount sont requis." });
  }

  const sql = `INSERT INTO Payment (orderId, userId, amount, status) VALUES (?, ?, ?, 'validé')`;

  db.query(sql, [orderId, userId, amount], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Paiement simulé validé avec succès." });
  });
});

// Voir les paiements d'un utilisateur
router.get('/my-payments', verifyToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `SELECT * FROM Payment WHERE userId = ? ORDER BY paymentDate DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
