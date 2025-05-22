const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ✅ pour le token

// ✅ Route : POST /signup (déjà faite)
router.post('/signup', async (req, res) => {
  const { username, email, password, phoneNumber, address } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO user (username, email, password, phoneNumber, address, isActive) VALUES (?, ?, ?, ?, ?, true)';
  
  db.query(sql, [username, email, hashedPassword, phoneNumber, address], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Utilisateur inscrit avec succès !" });
  });
});

// ✅ Route : POST /login (à ajouter maintenant)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const sql = 'SELECT * FROM user WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { userId: user.userId, username: user.username, email: user.email },
      'secret_jwt_key', // ⚠️ tu peux utiliser process.env.JWT_SECRET plus tard
      { expiresIn: '1h' }
    );

    res.json({ message: "Connexion réussie", token });
  });
});

module.exports = router;
