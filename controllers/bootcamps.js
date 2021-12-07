/* Módulos middleware que irão conter a lógica de nossos routes:*/

const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @desc    Obtem todos os bootcamps;
// @route   GET /api/v1/bootcamps;
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(201).json( res.advancedResults );
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
});

// @desc    Cria um bootcamp;
// @route   POST /api/v1/bootcamps;
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Adiciona o usuário logado ao corpo da solicitação recebida pelo HTTP do Postman:
    req.body.user = req.user.id;

    // Se o usuário não for admin, ele só poderá adicionar um bootcamp:
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`O usuário de ID '${req.user.id}' já fez uma publicação !`, 400));
    }

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
    // A antiga opção 'Bootcamp.findByIdAndDelete(req.params.id)' não servirá para o 'cascade delete' implementado, ele não irá acionar o 'remove' setado no middleware do bootcamp:
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.id}`, 404));    
    }

    // Necessário devido a implementação do cascade delete:
    bootcamp.remove();

    res.status(200).json({ success: true, msg: "Bootcamp deletado com sucesso !"});
});

// @desc    Verifica os bootcamps que estão próximos, de acordo com o raio (km);
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance;
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Utilizamos o geocode para traduzir os dados fornecidos na URL:
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lon = loc[0].longitude;

    /* Calculo do raio, a partir dos dados da URL.
    Calculo: raio / raio da terra;
    Raio da terra: 6.378 km*/
    const radius = distance / 6378;

    // Pesquisamos em nosso DB, pelos bootcamps próximos ao local que estipulamos, em Km:
    const bootcamps = await Bootcamp.find({
        // Usamos o método '$geoWithin', '$centerSphere' do geocoder, para verificar o bootcamp mais próximo:
        location: {$geoWithin: { $centerSphere: [ [ lon, lat ], radius ] } }
    });

    // Por fim, enviamos a resposta com os bootcamps encontrados:
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        results: bootcamps
    });
});


// @desc    Upload de fotos para um bootcamp;
// @route   DELETE /api/v1/bootcamps/:id;
// @access  Private
exports.fileupload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.id}`, 404));    
    }

    // Verifica se existe uma foto para upload:
    if(!req.files) {
        return next(new ErrorResponse(`Nenhuma foto foi inserida para upload !`, 400));
    }

    // Do request, obtemos a imagem em sí:
    const file = req.files.file;

    // Teste para verificar se o arquivo é uma imagem:
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Por favor, enviar um arquivo de imagem !`, 400));
    }

    // Teste do tamanho da imagem, não queremos que o upload seja de qualquer tamanho:
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`O limite do tamanho do arquivo é de ${process.env.MAX_FILE_UPLOAD}, por favor, enviar um arquivo menor !`, 400));
    }

    // Cria um nome customizado, para não haver sobrescrita no diretório destino:
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    // Execução do upload da imagem:
    file.mv(`${process.env.FILE_PATH_UPLOAD}/${file.name}`, async err => {
        if(err) {
            console.log(err);
            return next(new ErrorResponse(`Ocorreu um erro no envio do arquivo !`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({ success: true, data: file.name });
    });
});