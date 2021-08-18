const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    // Criamos um objeto de erro único, para todos os casos de erro que podem vir a ocorrer daqui para a frente. Este objeto irá receber todas os parâmetros do erro original, eles só serão modificados caso o erro seja algo previso nos 'ifs' abaixo:
    let error = {...err};

    // Temos de criar o atributo de mensagem em nosso novo objeto 'erro', pois o spread operator (ou '...') acima, copia apenas os atributos pertencentes ao objeto 'err', mas a mensagem de erro está só no protótipo do objeto erro, e isso o spread operator não faz, por isso temos de copiar o parâmetro manualmente abaixo: 
    error.message = err.message;

    // console.log(err);

    // Erro no Mongoose, bad ObjectID (Não identificou o ID):
    if(err.name === 'CastError') {
        const message = `Não foi possível identificar o recurso de ID num: ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Erro no Mongoose, duplicate key. Como o nome deste erro é genérico, optamos por usar seu código em sua identificação abaixo:
    if(err.code === 11000) {
        const message = `Recurso não pode ser inserido, pois este está duplicado na base de dados, key duplicada: ${err.keyValue.name}`;
        error = new ErrorResponse(message, 400);
    }

    // Erro no Mongoose, validação dos campos. Este tipo de erro é inserido em um array, pois mais de um campo pode apresentar o problema:
    if(err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => ' ' + val.message);
        error = new ErrorResponse(message, 400);
    }

    // Abaixo estamos utilizando a propriedade do nosso erro customizado: 
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Erro no servidor'
    });
}

module.exports = errorHandler;