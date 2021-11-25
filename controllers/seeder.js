/* Módulo responsável por preencher nossa base com os dados preenchidos, contidos na pasta '_data', apenas para facilitar o processo.
Como este processo de preenchimento não faz parte da API exatamente, iremos criar todo o ambiente dentro do módulo, de forma que este módulo não precisa de conexão com os demais:*/

const dotenv = require('dotenv');
// Carrega as variáveis do projeto:
dotenv.config({ path: '../config/config.env' });

const fs = require('fs');
const mongoose = require('mongoose');

const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');

// Conecta com o DB:
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Lê os arquivos JSON para fazer o carregamento no BD:
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/../_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/../_data/courses.json`, 'utf-8'));

// Importa o 'seed' em nosso DB:
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        console.log('Dados importados com sucesso !');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// Destroi os dados do banco, caso queiramos:
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        console.log('Dados deletados com sucesso !');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

/* Abaixo setamos os argumentos que podemos passar ao script para importar ou destroir os dados da base (ex: 'node seeder.js [-i] or [-d]').
Uma outra estratégia que poderíamos adotar, seria usar uma rota/URL específica para cada cenário, que ao ser acessada, executaria o respectivo procedimento.*/
if(process.argv[2] === '-i') {
    importData();
} else if(process.argv[2] === '-d') {
    deleteData();
}