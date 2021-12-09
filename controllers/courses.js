const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');


// @desc    Obtem todos os cursos;
// @route   GET /api/v1/courses;
// @route   GET /api/v1/bootcamps/:bootcampId;
// @access  Public.
exports.getCourses = asyncHandler(async (req, res, next) => {

    /* Queremos que este método suporte duas queries: 
    1 - Caso um id de bootcamp seja especificado, queremos saber qual o respectivo curso.
    2 - Caso nada seja especificado, retornar todos os cursos presentes no banco.
    OBS: Com o middleware 'advancedResults', não é mais necessário realizarmos as checagens por aqui, adicionamos o id do bootcamp na query por lá*/

    // Não queremos paginação quando verificamos os cursos de um bootcamp:
    if(req.params.bootcampId) {
        delete res.advancedResults['pagination'];
    };

    return res.status(200).json( res.advancedResults );
});


// @desc    Obtem um curso;
// @route   GET /api/v1/courses/:id;
// @access  Public.
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(new ErrorResponse(`Não foi possível identificar o Curso de ID num: ${req.params.id}`, 404));
    }
    
    res.status(200).json({ success: true, data: course });
});


// @desc    Adiciona um curso (CREATE);
// @route   POST /api/v1/bootcamp/:bootcampId/course;
// @access  Private.
exports.addCourse = asyncHandler(async (req, res, next) => {
    // Atualizamos o campo 'bootcamp' do modelo com o parâmetro passado pela URL.
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.bootcampId}`, 404));
    }

    // Checa se o usuário logado é o mesmo que criou o bootcamp relativo ao curso, somente este e o admin podem alterá-lo:
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`O usuário '${req.user.id}' não possui acesso aos cursos do bootcamp '${bootcamp._id}'.`, 404));
    }

    const course = await Course.create(req.body);
    
    res.status(200).json({ success: true, data: course });
});


// @desc    Atualiza um curso (UPDATE);
// @route   PUT /api/v1/courses/id;
// @access  Private.
exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`Não foi possível identificar o Curso de ID num: ${req.params.id}`, 404));
    }

    // Checa se o usuário logado é o mesmo que criou o bootcamp do curso em questão, somente este e o admin podem alterá-lo:
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`O usuário '${req.user.id}' não possui acesso ao curso '${course._id}'.`, 404));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({ success: true, data: course });
});


// @desc    Deleta um curso (DELETE);
// @route   PUT /api/v1/courses/id;
// @access  Private.
exports.deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`Não foi possível identificar o Curso de ID num: ${req.params.id}`, 404));
    }

    // Checa se o usuário logado é o mesmo que criou o bootcamp do curso em questão, somente este e o admin podem alterá-lo:
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`O usuário '${req.user.id}' não possui acesso ao curso '${course._id}'.`, 404));
    }

    await course.remove()
    
    res.status(200).json({ success: true});
});