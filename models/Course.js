const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Por favor, inserir o título do curso.']
    },
    description: {
        type: String,
        required: [true, 'Por favor, inserir uma descrição para o curso.']
    },
    weeks: {
        type: String,
        required: [true, 'Por favor, inserir o número de semanas do curso.']
    },
    tuition: {
        type: Number,
        required: [true, 'Por favor, inserir uma mensalidade para o curso.']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Por favor, inserir os requisitos mínimos para o curso.'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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
    }
});

module.exports = mongoose.model('Course', CourseSchema);