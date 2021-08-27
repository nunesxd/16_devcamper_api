/* Módulos middleware que irão conter a lógica de nossos routes:
Optamos por utilizar um conceito de versionamento (v1, v2, dentro da URL), onde poderíamos continuar usando uma versão anterior simultâneamente.
OBS: Anteriormente fizemos um try/catch dentro das funções async abaixo, mas identificamos que utilizando o módulo asyncHandler, podemos aproveitar do catch() das Promises criadas, retirando assim as repetições.*/

const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    Obtem todos os bootcamps;
// @route   GET /api/v1/bootcamps;
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    /* Podemos usar queries dentro da URL (separando os campos com '?'), para que o mongoose use no find() abaixo.
    Cabe mencionar, que estas queries precisam de uma "tradução" para serem usadas pelo JSON, por exemplo, devemos inserir o caractere '$' em casos de "menor do que X valor", pois o mongoose não realiza tal procedimento, e considera que o valor informado é uma ID, causando erro.
    Para os casos como o select e sort, como estes não são campos do schema, devemos retirá-los da query principal (que apenas realiza os matches por campo), eles seria separados, e incindiriam nos bootcamps encontrados pelo GET. Caso não tenha um select e sort na URL, o GET funcionaria normalmente.*/
    let query;

    const reqQuery = { ...req.query };

    // Remoção dos parâmetros que não queremos em nosso find, estas serão tratadas separadamente mais abaixo:
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(field => delete reqQuery[field]);

    let queryStr = JSON.stringify(reqQuery);

    // Estamos pegando os comandos abaixo e colocando um '$' antes, ex: gt - greater than, gte - grater than and equal.
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => '$' + match);
    
    query = Bootcamp.find(JSON.parse(queryStr));
    
    // Para os casos de SELECT, os campos a serem selecionados serão separados com uma ',', e não por espaços (que é necessário para o mongoose), para isso:
    if(req.query.select) {
        const selectFields = req.query.select.replace(',', " ");
        query = query.select(selectFields); // 'query' é um objeto do mongoose contendo bootcamps, selecionamos apenas os campos contidos no 'select';
    }

    // Para os casos de SORT:
    if(req.query.sort) {
        const sortFields = req.query.sort.replace(',', " ");
        query = query.sort(sortFields);
    } else {
        // Usaremos um sort padrão, por data:
        // OBS: O '-' é para descending, '+' para ascending.
        query = query.sort('-createdAt');
    }

    // Paginação:
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page-1) * limit; // caso tenhamos mais paginas, separemos os recursos adequadamente por elas.
    const endIndex = page * limit;
    const totalDoc = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const bootcamps = await query;

    // Resultado da paginação, que ficará dentro do JSON de resultado abaixo:
    const pagination = {};

    // Se tiver uma próxima página, mostre:
    if(endIndex < totalDoc) {
        pagination.nextPage = {
            page: page + 1,
            limit,
            totalDoc
        }
    }

    // Se tiver uma página anterior, mostre:
    if(startIndex > 0) {
        pagination.prevPage = {
            page: page - 1,
            limit,
            totalDoc
        }
    }

    res.status(201).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
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