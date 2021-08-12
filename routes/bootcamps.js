const express = require('express');
const router = express.Router();
const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp} = require('../controllers/bootcamps');

/* Apenas lembrando que podemos usar o router como o app do express, que fizemos em nosso módulo de entrada (server.js):
router.get('/', (req, res) => {});*/

// Abaixo estamos configurando as nossas rotas a partir da url setada no módulo de entrada:
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;