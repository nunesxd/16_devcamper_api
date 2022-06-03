const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Por favor, inserir o título do review.'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Por favor, inserir um texto para o review.']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Por favor, inserir uma avaliação dentre 1 e 10.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Abaixo criamos um link com o schema dos bootcamps, ou seja, um curso contém diversos bootcamps:
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Review', ReviewSchema);