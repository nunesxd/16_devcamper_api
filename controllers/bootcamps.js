/* Módulos middleware que irão conter a lógica de nossos routes:
Optamos por utilizar um conceito de versionamento (v1, v2, dentro da URL), onde poderíamos continuar usando uma versão anterior simultâneamente.
OBS: Anteriormente fizemos um try/catch dentro das funções async abaixo, mas identificamos que utilizando o módulo asyncHandler, podemos aproveitar do catch() das Promises criadas, retirando assim as repetições.*/

const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Obtem todos os bootcamps;
// @route   GET /api/v1/bootcamps;
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find(req.body);

    res.status(201).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc    Obtem apenas um bootcamp;
// @route   GET /api/v1/bootcamps/:id;
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.id}`, 404));
    }

    res.status(201).json({ success: true, data: bootcamp });

    //res.status(400).json({ success: false, error: err});
    /* Por padrão o express nos permite passar um erro pelo next(), nos enviando um html contendo o erro. Podemos utilizar o mesmo princípio, mas alterando o handling (para isso criamos o arquivo de erro na pasta de middlewares, e uma extensão da classe na pasta utils).
    Uma das formas de se fazer isso é criando um novo objeto de erro, como abaixo:
    next(new ErrorHandler(`Não foi possível identificar o Bootcamp de ID num: ${req.params.id}`, 404));
    Usando o 'catch' apenas, poderíamos escrever:
    next(err);*/
});

// @desc    Cria um bootcamp;
// @route   POST /api/v1/bootcamps;
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Usamos o mesmo processo, estrategia, de usar o await, e fazer o processo async, onde podemos usar o try/catch para gerenciar os erros. Essa estrategia foi desfeita, pois estamos utilizando o módulo asyncHandler.
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Atualiza um bootcamp;
// @route   PUT /api/v1/bootcamps/:id;
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    // As '{}' correspondem as opções deste método, no caso, ele irá retornar o item depois deste ser atualizado (new), e irá checar as informações enviadas com o schema (runValidators):
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.id}`, 404));   
    }

    res.status(200).json({ success: true, data: bootcamp });
})

// @desc    Deleta um bootcamp;
// @route   DELETE /api/v1/bootcamps/:id;
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // As '{}' correspondem as opções deste método, no caso, ele irá retornar o item depois deste ser atualizado (new), e irá checar as informações enviadas com o schema (runValidators):
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.id}`, 404));    
    }

    res.status(200).json({ success: true, msg: "Bootcamp deleted successfully !"});
})