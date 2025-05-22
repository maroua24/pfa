const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth'); // 🔒 vérifie le token

// 🔹 Ajouter un produit
router.post('/', verifyToken, (req, res) => {
  const { name, description, unitPrice, stockQuantity, supplierId } = req.body;

  const sql = `INSERT INTO product 
    (name, description, unitPrice, stockQuantity, isAvailable, supplierId) 
    VALUES (?, ?, ?, ?, true, ?)`;

  db.query(sql, [name, description, unitPrice, stockQuantity, supplierId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Produit ajouté avec succès" });
  });
});

// 🔹 Lister tous les produits
router.get('/', (req, res) => {
  db.query('SELECT * FROM product WHERE isAvailable = true', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 🔹 Modifier un produit
router.put('/:id', verifyToken, (req, res) => {
  const productId = req.params.id;
  const { name, description, unitPrice, stockQuantity } = req.body;

  const sql = `UPDATE product SET name = ?, description = ?, unitPrice = ?, stockQuantity = ? 
               WHERE productId = ?`;

  db.query(sql, [name, description, unitPrice, stockQuantity, productId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Produit mis à jour" });
  });
});

// 🔹 Supprimer un produit (soft delete = isAvailable = false)
router.delete('/:id', verifyToken, (req, res) => {
  const productId = req.params.id;

  const sql = `UPDATE product SET isAvailable = false WHERE productId = ?`;

  db.query(sql, [productId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Produit supprimé" });
  });
});

module.exports = router;
