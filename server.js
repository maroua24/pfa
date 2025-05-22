const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion DB
const db = require('./db');

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protected.routes');
app.use('/api/protected', protectedRoutes);

const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

const groupOrderRoutes = require('./routes/grouporder.routes');
app.use('/api/grouporders', groupOrderRoutes);

// ✅ Nouvelle route pour exprimer un besoin
const needRoutes = require('./routes/need.routes');
app.use('/api/needs', needRoutes);
 

const groupParticipationRoutes = require('./routes/groupParticipation.routes');
app.use('/api/groupParticipation', groupParticipationRoutes);

const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);

const reviewRoutes = require('./routes/review.routes');
app.use('/api/reviews', reviewRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payments', paymentRoutes);

const notificationRoutes = require('./routes/notification.routes');
app.use('/api/notifications', notificationRoutes);

const groupOrderValidationRoutes = require('./routes/grouporder.validation.routes');
app.use('/api/grouporders', groupOrderValidationRoutes);

// Démarrer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
