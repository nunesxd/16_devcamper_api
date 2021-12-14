const express = require('express');
const router = express.Router();
const {register, login, getMe, forgotPassword} = require('../controllers/auth');

// Middleware de proteção, verificação dos tokens dos usuários. Deve ser passado como primeiro argumento das rotas:
const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.get('/me', protect, getMe);

module.exports = router;