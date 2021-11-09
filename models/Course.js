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

// Criação de um método estático para o schema de courses:
CourseSchema.statics.getAvgCost = async function(bootcampId) {
    console.log(`Calculating average cost... do bootcamp: ${bootcampId}`);

    // O 'aggregate' recebe um pipeline, uma sequência de instruções:
    const obj = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition'}
            }
        }
    ]);

    console.log(obj);
};

// Executa 'getAvgCost' depois que o curso for salvo:
CourseSchema.post('save', function() {
    this.constructor.getAvgCost(this.bootcamp);
});

// Executa 'getAvgCost' antes que o curso seja deletado:
CourseSchema.pre('remove', function() {
    this.constructor.getAvgCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);