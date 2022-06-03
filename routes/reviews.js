const express = require('express'); 
const {getReviews/**, getCourse, addCourse, updateCourse, deleteCourse**/} = require('../controllers/reviews');

// Advanced Queries middleware:
const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');
// Middleware de proteção, verificação dos tokens dos usuários. Deve ser passado como primeiro argumento das rotas:
const {protect, authorize} = require('../middleware/auth');

// Ativamos a opção de 'mergeParams' pois estamos utlizando o re-roteamento de bootcamps para este recurso:
const router = express.Router({ mergeParams: true });

// Rotas:
router.route('/')
    .get(advancedResults(Review, { path: 'bootcamp', select: 'name description' }), getReviews)
    //.post(protect, authorize('publisher', 'admin'), addCourse);
//router.route('/:id').get(getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;