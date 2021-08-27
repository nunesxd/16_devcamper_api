const Course = require('../models/Course');
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
        query = Course.find({});
    }

    const courses = await query;
    res.status(200).json({ success: true, count: courses.length, data: courses });
})