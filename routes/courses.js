const express = require('express'); 
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/courses');
// Ativamos a opção de 'mergeParams' pois estamos utlizando o re-roteamento de bootcamps para este recurso:
const router = express.Router({ mergeParams: true });

// Rotas:
router.route('/').get(getCourses).post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;