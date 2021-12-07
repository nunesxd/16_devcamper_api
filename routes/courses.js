const express = require('express'); 
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/courses');

// Advanced Queries middleware:
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

// Middleware de proteção, verificação dos tokens dos usuários. Deve ser passado como primeiro argumento das rotas:
const {protect, authorize} = require('../middleware/auth');

// Ativamos a opção de 'mergeParams' pois estamos utlizando o re-roteamento de bootcamps para este recurso:
const router = express.Router({ mergeParams: true });

// Rotas:
router.route('/')
    .get(advancedResults(Course, { path: 'bootcamp', select: 'name description' }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse);
router.route('/:id').get(getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;