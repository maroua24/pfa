const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// POST /api/groupParticipation/:orderId/join — Rejoindre un groupe d’achat
router.post('/:orderId/join', verifyToken, (req, res) => {
  const orderId = req.params.orderId;
  const userId = req.user.userId;

  // 1. Vérifier si le groupe existe et est ouvert
  const checkGroupSql = `SELECT * FROM grouporder WHERE orderId = ? AND status = 'ouvert'`;

  db.query(checkGroupSql, [orderId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: "Groupe non trouvé ou fermé" });
    }

    const group = results[0];

    // 2. Vérifier si le groupe est plein
    if (group.currentGroupSize >= group.maxGroupSize) {
      return res.status(400).json({ message: "Groupe déjà complet" });
    }

    // 3. Vérifier si utilisateur a déjà rejoint ce groupe
    const checkParticipationSql = `SELECT * FROM GroupParticipation WHERE orderId = ? AND userId = ?`;

    db.query(checkParticipationSql, [orderId, userId], (err, participation) => {
      if (err) return res.status(500).json({ error: err });
      if (participation.length > 0) {
        return res.status(400).json({ message: "Vous avez déjà rejoint ce groupe" });
      }

      // 4. Ajouter la participation
      const insertParticipationSql = `INSERT INTO GroupParticipation (orderId, userId) VALUES (?, ?)`;

      db.query(insertParticipationSql, [orderId, userId], (err) => {
        if (err) return res.status(500).json({ error: err });

        // 5. Incrémenter la taille du groupe
        const updateGroupSql = `UPDATE grouporder SET currentGroupSize = currentGroupSize + 1 WHERE orderId = ?`;

        db.query(updateGroupSql, [orderId], (err) => {
          if (err) return res.status(500).json({ error: err });

          return res.status(200).json({ message: "Vous avez rejoint le groupe avec succès" });
        });
      });
    });
  });
});

module.exports = router;
