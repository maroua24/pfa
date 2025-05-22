// ✅ Middleware : checkRole.js
// Permet de vérifier si l'utilisateur a un rôle autorisé pour accéder à une ressource

module.exports = function checkRole(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Accès refusé : rôle insuffisant.' });
    }

    next();
  };
};
