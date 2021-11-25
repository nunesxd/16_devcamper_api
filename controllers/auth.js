const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Registra um usuário;
// @route   GET /api/v1/auth/register;
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    res.status(201).json({ success: true });
});