const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Registra um usuário;
// @route   POST /api/v1/auth/register;
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

    // Cria o token JWT, método de nosso modelo:
    const token = user.getSignedJwtToken();

    res.status(200).json({ success: true, token });
});


// @desc    Login do usuário;
// @route   POST /api/v1/auth/login;
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    // Destructuring dos elementos que precisamos analisar para o registro do novo usuário:
    const { email, password } = req.body;

    // Validação do email e da senha:
    if(!email || !password) {
        return next(new ErrorResponse('Por favor, inserir um email e senha !', 400));
    };

    // Checa se o usuário existe:
    const user = await User.findOne({ email }).select('+password');
    if(!user) {
        return next(new ErrorResponse('Usuário não identificado, por favor, inserir outras credenciais !', 400));
    };

    // Verifica se a senha é válida:
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse('Usuário não identificado, por favor, inserir outras credenciais !', 400));
    };

    // Cria o token JWT, método de nosso modelo:
    const token = user.getSignedJwtToken();

    res.status(200).json({ success: true, token });
});