const express = require('express'); 
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/courses');

// Advanced Queries middleware:
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

// Ativamos a opção de 'mergeParams' pois estamos utlizando o re-roteamento de bootcamps para este recurso:
const router = express.Router({ mergeParams: true });

// Rotas:
router.route('/')
    .get(advancedResults(Course, { path: 'bootcamp', select: 'name description' }), getCourses)
    .post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;