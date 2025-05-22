const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// 🔹 Créer une commande groupée
router.post('/', verifyToken, (req, res) => {
  const { status, totalAmount, supplierId, maxGroupSize, minGroupSize, deliveryAddress } = req.body;
  const userId = req.user.userId;

  const sql = `INSERT INTO grouporder 
    (status, totalAmount, supplierId, maxGroupSize, minGroupSize, currentGroupSize, deliveryAddress, userId) 
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)`;

  db.query(sql, [status, totalAmount, supplierId, maxGroupSize, minGroupSize, deliveryAddress, userId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Groupe créé avec succès" });
  });
});

// 🔹 Voir les groupes disponibles
router.get('/', (req, res) => {
  db.query('SELECT * FROM grouporder WHERE status = "ouvert"', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 🔹 Rejoindre un groupe
router.post('/:id/join', verifyToken, (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.userId;

  const checkSql = `SELECT * FROM grouporder WHERE orderId = ? AND status = 'ouvert'`;

  db.query(checkSql, [groupId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: "Groupe non trouvé ou fermé" });
    }

    const group = results[0];

    if (group.currentGroupSize >= group.maxGroupSize) {
      return res.status(400).json({ message: "Groupe déjà complet" });
    }

    const checkParticipation = `SELECT * FROM GroupParticipation WHERE orderId = ? AND userId = ?`;
    db.query(checkParticipation, [groupId, userId], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.length > 0) {
        return res.status(400).json({ message: "Vous avez déjà rejoint ce groupe" });
      }

      const insertSql = `INSERT INTO GroupParticipation (orderId, userId) VALUES (?, ?)`;
      db.query(insertSql, [groupId, userId], (err) => {
        if (err) return res.status(500).json({ error: err });

        const updateSql = `UPDATE grouporder SET currentGroupSize = currentGroupSize + 1 WHERE orderId = ?`;
        db.query(updateSql, [groupId], (err) => {
          if (err) return res.status(500).json({ error: err });
          res.status(200).json({ message: "Vous avez rejoint le groupe avec succès" });
        });
      });
    });
  });
});

module.exports = router;
