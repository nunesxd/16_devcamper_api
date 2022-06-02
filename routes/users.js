const express = require('express'); 
const {getUsers, getUser, createUser, updateUser, deleteUser} = require('../controllers/users');

// Advanced Queries middleware:
const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');
// Middleware de proteção, verificação dos tokens dos usuários. Deve ser passado como primeiro argumento das rotas:
const {protect, authorize} = require('../middleware/auth');

// Ativamos a opção de 'mergeParams' pois estamos utlizando o re-roteamento de bootcamps para este recurso:
const router = express.Router({ mergeParams: true });

// Rotas:

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);
router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;