const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Registra um usuário;
// @route   GET /api/v1/auth/register;
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    // Destructuring dos elementos que precisamos analisar para o registro do novo usuário:
    const {name, email, password, role} = req.body;

    // Criação do usuário:
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    res.status(200).json({ success: true });
});