const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Verificamos se existe as informações do usuário na requisição:
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Pegamos apenas o token no final da string:
        token = req.headers.authorization.split(' ')[1];
    }
    // Caso não tenha, pegamos os usuários através dos cookies no browser, essa funcionalidade será usada apenas em produção:
    else if(req.cookies.token) {
        token = req.cookies.token;
    }

    // Validação da existência do token do usuário:
    if(!token) {
        return next(new ErrorResponse('Acesso não autorizado !', 401));
    }

    try {
        // Verificação do conteúdo do token:
        const tknDecoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(tknDecoded);

        // Logamos o usuário com o ID inserido no token enviado:
        req.user = await User.findById(tknDecoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('Acesso não autorizado !', 401));
    }
});

// Segregação de função das roles:
// OBS: Utilização de uma 'high order function'.
exports.authorize = (...roles) => (req, res, next) => {
    if(!roles.includes(req.user.role)) {
        return next(new ErrorResponse(`Usuários com a role '${req.user.role}' não podem executar esta ação !`, 401));
    }
    return next();
};