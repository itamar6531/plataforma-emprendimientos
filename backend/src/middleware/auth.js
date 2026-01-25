const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * 
 * Verifica que el usuario esté autenticado mediante JWT
 * Protege rutas que requieren estar logueado
 * 
 * Uso: Se coloca antes de las rutas protegidas
 */

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Verificar si el token existe en los headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extraer el token: "Bearer TOKEN_AQUI"
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Si no hay token, no está autenticado
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.'
      });
    }

    // 3. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar el usuario por ID (viene en el token)
    req.user = await User.findById(decoded.id).select('-password');

    // 5. Verificar que el usuario exista
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 6. Todo OK, continuar a la siguiente función
    next();

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);

    // Token inválido o expirado
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicia sesión de nuevo.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

/**
 * MIDDLEWARE PARA VERIFICAR TIPO DE USUARIO
 * 
 * Verifica que el usuario sea de un tipo específico
 * Uso: protect, restrictTo('emprendedor')
 */
const restrictTo = (...userTypes) => {
  return (req, res, next) => {
    // userTypes = ['emprendedor', 'inversionista']
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `No tienes permiso para realizar esta acción. Solo usuarios tipo: ${userTypes.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
