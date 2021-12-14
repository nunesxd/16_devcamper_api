const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, inserir um nome.']
    },
    email: {
        type: String,
        required:[true, 'Por favor, adicionar um e-mail'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Por favor, inserir uma senha.'],
        minlength: 6,
        // Caso o usuário seja identificado na base, não retornará a senha.
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encripração da senha do usuário usando 'bcryptjs':
UserSchema.pre('save', async function(next) {
    // Caso estejamos salvando outras informações, que não sejam senha, no usuário, passamos adiante:
    if(!this.isModified('password')) {
        next();
    }

    // Geração da hash, 10 é o número de complexidade recomendado:
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
});

// Gera token JWT:
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Valida a senha inserida no login, com a senha encriptada no BD:
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Cria e criptografa o token de solicitação de senha gerado:
UserSchema.methods.getResetPassToken = async function(enteredPassword) {
    
    // Gera o token utilizando a biblioteca 'crypto':
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Criptografa o token gerado e o armazena no campo 'resetPasswordToken' do modelo:
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Define a data de expiração do token:
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);