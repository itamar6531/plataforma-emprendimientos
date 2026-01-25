const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * RUTAS DE AUTENTICACIÓN
 * Base: /api/auth
 */

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren token)
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;




