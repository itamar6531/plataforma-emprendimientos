const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const InvestorProfile = require('../models/InvestorProfile');

/**
 * GENERAR JWT TOKEN
 * 
 * Crea un token JWT con el ID del usuario
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, userType, phone, location, bio } = req.body;

    // 1. Validar campos requeridos
    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, email, contraseña y tipo de usuario'
      });
    }

    // 2. Verificar que el email no esté registrado
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // 3. Validar tipo de usuario
    if (!['emprendedor', 'inversionista'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de usuario debe ser "emprendedor" o "inversionista"'
      });
    }

    // 4. Crear el usuario
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Se hashea automáticamente por el middleware del modelo
      userType,
      phone,
      location,
      bio
    });

    // 5. Crear perfil según tipo de usuario
    if (userType === 'emprendedor') {
      await EntrepreneurProfile.create({
        userId: user._id
      });
    } else {
      await InvestorProfile.create({
        userId: user._id
      });
    }

    // 6. Generar token JWT
    const token = generateToken(user._id);

    // 7. Cargar el perfil para devolver
    const userWithProfile = await User.findById(user._id)
      .populate('entrepreneurProfile')
      .populate('investorProfile')
      .select('-password');

    // 8. Responder
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userWithProfile,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);

    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // 2. Buscar usuario (incluir password para comparar)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 3. Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 4. Generar token
    const token = generateToken(user._id);

    // 5. Cargar perfil
    const userWithProfile = await User.findById(user._id)
      .populate('entrepreneurProfile')
      .populate('investorProfile')
      .select('-password');

    // 6. Responder
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithProfile,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
};

/**
 * @desc    Obtener usuario actual (verificar token)
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // req.user ya viene del middleware 'protect'
    const user = await User.findById(req.user._id)
      .populate('entrepreneurProfile')
      .populate('investorProfile')
      .select('-password');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
};

/**
 * @desc    Actualizar contraseña
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Validar campos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona contraseña actual y nueva contraseña'
      });
    }

    // 2. Buscar usuario con password
    const user = await User.findById(req.user._id).select('+password');

    // 3. Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // 4. Actualizar contraseña
    user.password = newPassword;
    await user.save(); // Se hashea automáticamente

    // 5. Generar nuevo token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: { token }
    });

  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword
};