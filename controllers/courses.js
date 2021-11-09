const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Obtem todos os cursos;
// @route   GET /api/v1/courses;
// @route   GET /api/v1/bootcamps/:bootcampId;
// @access  Public.
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    /* Queremos que este método suporte duas queries: 
    1 - Caso um id de bootcamp seja especificado, queremos saber qual o respectivo curso.
    2 - Caso nada seja especificado, retornar todos os cursos presentes no banco.*/
    if(req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        /* Com o 'populate', os demais dados dos bootcamps serão preechidos na consulta, sem ele, apenas o id do respectivo bootcamp seria visualizado.
        Se colocarmos o 'bootcamp', todos os dados serão mostrados, para selecionar a visualização, devemos passar um objeto.*/
        query = Course.find({}).populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }

    const courses = await query;
    res.status(200).json({ success: true, count: courses.length, data: courses });
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

// @desc    Adiciona um curso;
// @route   POST /api/v1/bootcamp/:bootcampId/course;
// @access  Private.
exports.addCourse = asyncHandler(async (req, res, next) => {
    // Atualizamos o campo 'bootcamp' do modelo com o parâmetro passado pela URL.
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`Não foi possível identificar o Bootcamp de ID num: ${req.params.bootcampId}`, 404));
    }

    const course = await Course.create(req.body);
    
    res.status(200).json({ success: true, data: course });
});