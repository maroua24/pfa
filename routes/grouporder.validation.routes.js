const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole'); // middleware admin/vendeur

// ✅ Route pour valider une commande groupée (vendeur ou admin)
router.put('/:orderId/validate', verifyToken, checkRole(['admin', 'vendeur']), (req, res) => {
  const orderId = req.params.orderId;

  // Étape 1 : vérifier currentGroupSize vs minGroupSize
  const sqlCheck = `SELECT * FROM grouporder WHERE orderId = ?`;
  db.query(sqlCheck, [orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: 'Commande non trouvée' });

    const group = result[0];
    if (group.currentGroupSize < group.minGroupSize) {
      return res.status(400).json({ message: "Le groupe n'a pas encore atteint le minimum requis." });
    }

    // Étape 2 : valider la commande
    const sqlUpdate = `UPDATE grouporder SET status = 'validé' WHERE orderId = ?`;
    db.query(sqlUpdate, [orderId], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      // 🔔 Notifier tous les participants
      const message = `Votre commande groupée #${orderId} a été validée !`;
      const notifSql = `
        INSERT INTO Notification (userId, message)
        SELECT userId, ? FROM GroupParticipation WHERE orderId = ?
      `;
      db.query(notifSql, [message, orderId], (err3) => {
        if (err3) return res.status(500).json({ error: err3 });

        res.status(200).json({ message: "Commande validée et notifications envoyées." });
      });
    });
  });
});

module.exports = router;
