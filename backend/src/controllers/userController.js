const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const InvestorProfile = require('../models/InvestorProfile');

/**
 * @desc    Listar usuarios (emprendedores o inversionistas)
 * @route   GET /api/users
 * @access  Private
 * @query   ?type=emprendedor&search=&location=&page=1&limit=20
 */
const getUsers = async (req, res) => {
  try {
    const {
      type,        // 'emprendedor' o 'inversionista'
      search,      // Búsqueda en nombre o bio
      location,    // Filtrar por ubicación
      forChat,     // Solo usuarios del tipo opuesto (para chat)
      page = 1,
      limit = 20
    } = req.query;

    // Construir query
    const query = {};

    // Excluir al usuario actual
    query._id = { $ne: req.user._id };

    // Si es para chat, solo mostrar usuarios del tipo opuesto
    if (forChat === 'true') {
      query.userType = req.user.userType === 'emprendedor' ? 'inversionista' : 'emprendedor';
    } else if (type && ['emprendedor', 'inversionista'].includes(type)) {
      // Filtrar por tipo de usuario si se especifica
      query.userType = type;
    }

    // Búsqueda por texto
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrar por ubicación
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Ejecutar query
    const users = await User.find(query)
      .populate('entrepreneurProfile')
      .populate('investorProfile')
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    // Contar total
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('entrepreneurProfile')
      .populate('investorProfile')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
};

/**
 * @desc    Actualizar perfil del usuario actual
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, location, bio, ...profileData } = req.body;

    // 1. Actualizar datos básicos del usuario
    const updateUserData = {};
    if (name) updateUserData.name = name;
    if (phone !== undefined) updateUserData.phone = phone;
    if (location !== undefined) updateUserData.location = location;
    if (bio !== undefined) updateUserData.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      updateUserData,
      { new: true, runValidators: true }
    );

    // 2. Actualizar perfil específico según tipo de usuario
    if (req.user.userType === 'emprendedor') {
      // Campos permitidos para emprendedor
      const entrepreneurUpdateData = {};
      if (profileData.projectName) entrepreneurUpdateData.projectName = profileData.projectName;
      if (profileData.projectDescription) entrepreneurUpdateData.projectDescription = profileData.projectDescription;
      if (profileData.sector) entrepreneurUpdateData.sector = profileData.sector;
      if (profileData.fundingNeeded !== undefined) entrepreneurUpdateData.fundingNeeded = profileData.fundingNeeded;
      if (profileData.stage) entrepreneurUpdateData.stage = profileData.stage;
      if (profileData.yearsInBusiness !== undefined) entrepreneurUpdateData.yearsInBusiness = profileData.yearsInBusiness;
      if (profileData.numberOfEmployees !== undefined) entrepreneurUpdateData.numberOfEmployees = profileData.numberOfEmployees;
      if (profileData.businessLocation) entrepreneurUpdateData.businessLocation = profileData.businessLocation;

      // Campos para modelo predictivo
      if (profileData.educationLevel) entrepreneurUpdateData.educationLevel = profileData.educationLevel;
      if (profileData.previousExperienceYears !== undefined) entrepreneurUpdateData.previousExperienceYears = profileData.previousExperienceYears;
      if (profileData.hasBusinessPlan !== undefined) entrepreneurUpdateData.hasBusinessPlan = profileData.hasBusinessPlan;
      if (profileData.marketValidationLevel) entrepreneurUpdateData.marketValidationLevel = profileData.marketValidationLevel;
      if (profileData.initialCapital !== undefined) entrepreneurUpdateData.initialCapital = profileData.initialCapital;
      if (profileData.projectedMonthlyRevenue !== undefined) entrepreneurUpdateData.projectedMonthlyRevenue = profileData.projectedMonthlyRevenue;

      // Limpiar la predicción anterior para forzar recálculo
      entrepreneurUpdateData.predictionScore = null;

      await EntrepreneurProfile.findOneAndUpdate(
        { userId },
        entrepreneurUpdateData,
        { new: true, runValidators: true }
      );
    } else {
      // Campos permitidos para inversionista
      const investorUpdateData = {};
      if (profileData.investmentInterests) investorUpdateData.investmentInterests = profileData.investmentInterests;
      if (profileData.investmentRange) investorUpdateData.investmentRange = profileData.investmentRange;
      if (profileData.sectorsOfInterest) investorUpdateData.sectorsOfInterest = profileData.sectorsOfInterest;
      if (profileData.yearsExperience !== undefined) investorUpdateData.yearsExperience = profileData.yearsExperience;
      if (profileData.numberOfInvestments !== undefined) investorUpdateData.numberOfInvestments = profileData.numberOfInvestments;
      if (profileData.investorType) investorUpdateData.investorType = profileData.investorType;
      if (profileData.partnershipType) investorUpdateData.partnershipType = profileData.partnershipType;

      await InvestorProfile.findOneAndUpdate(
        { userId },
        investorUpdateData,
        { new: true, runValidators: true }
      );
    }

    // 3. Devolver usuario actualizado con perfil
    const updatedUser = await User.findById(userId)
      .populate('entrepreneurProfile')
      .populate('investorProfile')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile
};
