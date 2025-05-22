const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// POST /api/orders/:orderId/items — Ajouter un produit à une commande de groupe
router.post('/:orderId/items', verifyToken, (req, res) => {
  const orderId = req.params.orderId;
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: "productId et quantity sont requis." });
  }

  const sql = `INSERT INTO OrderItem (orderId, userId, productId, quantity) VALUES (?, ?, ?, ?)`;

  db.query(sql, [orderId, userId, productId, quantity], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Produit ajouté à la commande avec succès." });
  });
});

// GET /api/orders/:orderId/my-items — Voir les produits commandés par l’utilisateur dans ce groupe
router.get('/:orderId/my-items', verifyToken, (req, res) => {
  const orderId = req.params.orderId;
  const userId = req.user.userId;

  const sql = `
    SELECT oi.*, p.name, p.unitPrice 
    FROM OrderItem oi
    JOIN product p ON oi.productId = p.productId
    WHERE oi.orderId = ? AND oi.userId = ?
  `;

  db.query(sql, [orderId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
