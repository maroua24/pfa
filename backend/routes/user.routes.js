const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin'); // Middleware à créer pour vérifier admin

// Lister tous les utilisateurs (admin uniquement)
router.get('/', verifyToken, isAdmin, (req, res) => {
  const sql = 'SELECT userId, username, email, phoneNumber, address, isActive FROM user';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Modifier un utilisateur (admin ou utilisateur lui-même)
router.put('/:userId', verifyToken, (req, res) => {
  const { userId } = req.params;
  const { username, email, phoneNumber, address, isActive } = req.body;

  // Vérifier que l'utilisateur est admin ou modifie son propre profil
  if (req.user.userId !== Number(userId) && !req.user.isAdmin) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const sql = `UPDATE user SET username=?, email=?, phoneNumber=?, address=?, isActive=? WHERE userId=?`;
  db.query(sql, [username, email, phoneNumber, address, isActive, userId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Utilisateur mis à jour" });
  });
});

// Supprimer (désactiver) un utilisateur (admin uniquement)
router.delete('/:userId', verifyToken, isAdmin, (req, res) => {
  const { userId } = req.params;
  const sql = `UPDATE user SET isActive = false WHERE userId = ?`;
  db.query(sql, [userId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Utilisateur désactivé" });
  });
});

module.exports = router;
// Changer de rôle : acheteur ⇄ vendeur ⇄ admin
router.put('/role', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { newRole } = req.body;

  const allowedRoles = ['acheteur', 'vendeur', 'admin'];
  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ message: "Rôle invalide." });
  }

  const sql = `UPDATE user SET role = ? WHERE userId = ?`;
  db.query(sql, [newRole, userId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: `Votre rôle est maintenant : ${newRole}` });
  });
});
