const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Lister notifications d’un utilisateur
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const sql = `SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Marquer une notification comme lue
router.put('/:id/read', verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const sql = `UPDATE Notification SET isRead = TRUE WHERE notificationId = ?`;
  db.query(sql, [notificationId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Notification marquée comme lue" });
  });
});

module.exports = router;
