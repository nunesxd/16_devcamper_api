/* Módulos middleware que irão conter a lógica de nossos routes:
Optamos por utilizar um conceito de versionamento, onde poderíamos continuar usando uma versão anterior simultâneamente.*/

const Bootcamp = require('../models/Bootcamp');

// @desc    Obtem todos os bootcamps;
// @route   GET /api/v1/bootcamps;
// @access  Public
exports.getBootcamps = (req, res, next) => {
    //res.status(200).json({ success: true, msg: 'Show all bootcamps' }); // Apenas para testes;
}

// @desc    Obtem apenas um bootcamp;
// @route   GET /api/v1/bootcamps/:id;
// @access  Public
exports.getBootcamp = (req, res, next) => {
    
}

// @desc    Cria um bootcamp;
// @route   POST /api/v1/bootcamps;
// @access  Private
exports.createBootcamp = async (req, res, next) => {
    // Usamos o mesmo processo, estrategia, de usar o await, e fazer o processo async, onde podemos usar o try/catch para gerenciar os erros:
    try {
        const bootcamp = await Bootcamp.create(req.body);
    
        res.status(201).json({ success: true, data: bootcamp });
    } catch (error) {
        res.status(400).json({ success: false, msg: error});
    }
}

// @desc    Atualiza um bootcamp;
// @route   PUT /api/v1/bootcamps/:id;
// @access  Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Update bootcamp ID: ${req.params.id}` });
}

// @desc    Deleta um bootcamp;
// @route   DELETE /api/v1/bootcamps/:id;
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Delete bootcamp ID: ${req.params.id}` });
}