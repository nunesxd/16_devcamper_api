const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
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


// @desc    Verifica o usuário logado;
// @route   POST /api/v1/auth/me;
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});


// @desc    Update da senha do usuário;
// @route   PUT /api/v1/auth/updatepassword;
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    // Solicitamos o password antigo para validar a troca:
    const user = await User.findById(req.user.id).select('+password');

    // Validamos se a senha bate com a atual:
    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Senha atual está errada !', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, res, 200);
});


// @desc    Update dos detalhes do usuário;
// @route   PUT /api/v1/auth/updatedetails;
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});


// @desc    Esqueceu a senha;
// @route   POST /api/v1/auth/forgotpassword;
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email:req.body.email });

    if(!user) {
        return next(new ErrorResponse('Usuário não identificado, por favor, inserir outro e-mail !', 404));
    };

    const resetToken = user.getResetPassToken();

    await user.save({ validateBeforeSave: false });

    // Cria url do reset:
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `Email de solicitação de reset de senha. Por favor, realize um PUT request para o endereço: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message: message
        });

        res.status(200).json({
            success: true,
            data: 'Email enviado'
        });
    } catch (err) {
        console.log(err);
        // Caso não seja possível enviar o email, teremos de recomeçar o processo de reset de senha.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email não pode ser enviado !', 500));
    }
});


// @desc    Reset do usuário;
// @route   POST /api/v1/auth/resetpassword/:resettoken;
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Obtem o token hased:
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user){
        return next(new ErrorResponse('Token inválido !', 400));
    }

    // Caso o usuário seja identificado, resetamos sua senha e a solicitação de reset:
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

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
};