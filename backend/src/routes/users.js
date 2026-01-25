const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

/**
 * RUTAS DE USUARIOS
 * Base: /api/users
 * Todas requieren autenticación
 */

router.use(protect); // Aplicar middleware a todas las rutas

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);

module.exports = router;
