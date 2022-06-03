const express = require('express');
const router = express.Router();
const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, fileupload} = require('../controllers/bootcamps');

// Advanced Queries middleware:
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Middleware de proteção, verificação dos tokens dos usuários. Deve ser passado como primeiro argumento das rotas:
const {protect, authorize} = require('../middleware/auth');

/* Apenas lembrando que podemos usar o router como o app do express, que fizemos em nosso módulo de entrada (server.js):
router.get('/', (req, res) => {});*/

/* Abaixo incluimos rotas de outros recursos, pois por exemplo, os cursos tem uma relação com os bootcamps, temos uma rota onde queremos obter os cursos referentes a aquele bootcamp e, para isso, queremos utilizar o caminho dos bootcamps ("/bootcamps"). 
Então, para facilitar o entendimento, é interessante realizarmos um re-roteamento originado da rota de bootcamps para os outros recursos:*/
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// Re-roteamento dos métodos que seriam de outros recursos:
router.use('/:bootcampId/courses', courseRouter); // Vindo de courses;
router.use('/:bootcampId/reviews', reviewRouter); // Vindo de reviews;

// Abaixo estamos configurando as nossas rotas a partir da url setada no módulo de entrada:
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);
router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
// router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), fileupload);

module.exports = router;