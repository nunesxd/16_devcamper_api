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

// Evitar que um usuário possa adicionar mais de um review por bootcamp:
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Criação de um método estático para o schema de review:
ReviewSchema.statics.getAvgReview = async function(bootcampId) {

    // O 'aggregate' recebe um pipeline, uma sequência de instruções:
    const obj = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating'}
            }
        }
    ]);
    
    console.log(obj);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: Math.round((obj[0].averageRating + Number.EPSILON) * 100) / 100
        });
        console.log("Executou o update da média de reviews do bootcamp !!!");
        console.log('Rating: ' + Math.round((obj[0].averageRating + Number.EPSILON) * 100) / 100);
    } catch (err) {
        console.error(err);
    }
};

// Executa 'getAvgReview' depois que o curso for salvo:
ReviewSchema.post('save', async function() {
    await this.constructor.getAvgReview(this.bootcamp);
});

// Executa 'getAvgReview' antes que o curso seja deletado:
ReviewSchema.post('remove', async function() {
    await this.constructor.getAvgReview(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);