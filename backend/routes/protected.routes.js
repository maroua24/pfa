const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth'); // ← ce fichier doit aussi exister

// ✅ Route sécurisée
router.get('/secure', verifyToken, (req, res) => {
  res.json({
    message: `Bienvenue ${req.user.username}, tu es connecté !`,
    user: req.user
  });
});

// ✅ Ne surtout pas oublier :
module.exports = router;
