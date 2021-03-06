const express = require('express');
const router = express.Router();
const {register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout} = require('../controllers/auth');

// Middleware de proteção, verificação dos tokens dos usuários. Deve ser passado como primeiro argumento das rotas:
const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router
    .get('/me', protect, getMe)
    .get('/logout', protect, logout);

module.exports = router;