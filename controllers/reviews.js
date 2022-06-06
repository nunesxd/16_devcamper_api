const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');


// @desc    Obtem todos os reviews;
// @route   GET /api/v1/reviews;
// @route   GET /api/v1/bootcamps/:bootcampId/reviews;
// @access  Public.
exports.getReviews = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        return res.status(200).json( res.advancedResults );
    }
});


// @desc    Obtem todos um review específico;
// @route   GET /api/v1/reviews/:id;
// @access  Public.
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!review) {
        return next(new ErrorResponse(`Não foi possível identificar o Review de ID num: ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: review });
});