const express = require('express'); 
const {getCourses} = require('../controllers/courses');
// Ativamos a opção de 'mergeParams' pois estamos utlizando o re-roteamento de bootcamps para este recurso:
const router = express.Router({ mergeParams: true });

// Rotas:
router.route('/').get(getCourses);

module.exports = router;