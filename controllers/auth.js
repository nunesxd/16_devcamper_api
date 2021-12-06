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
    
    sendTokenResponse(user, res, 200);
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
    
    sendTokenResponse(user, res, 200);
});


// Obtem token, cria o cookie e envia a resposta:
const sendTokenResponse = (user, res, statusCode) => {
    // Cria o token JWT, método de nosso modelo:
    const token = user.getSignedJwtToken();

    // Opções para a criação do nosso cookie:
    // OBS: O restante do calculo serve para transformar o valor em 30 dias.
    // O httpOnly sinaliza que o cookie pode ser lido pelo JS no browser do client. 
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    // Opção que envio o cookie pelo método HTTPS, que queremos apenas se o ambiente for de produção:
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }   

    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
} 