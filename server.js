const express = require('express');
const dotenv = require('dotenv');
const bootcamps = require('./routes/bootcamps'); // Arquivo de rotas.
//const logger = require('./middleware/logger'); // Apenas um exemplo de log, simples demonstração de middleware.
const morgan = require('morgan');

// Carregando as variáveis do projeto:
dotenv.config({ path: './config/config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

//app.use(logger);
// Abaixo usamos uma biblioteca de log mais completa:
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Configuração das rotas, assim não precisamos deixar a URL completa lá:
app.use('/api/v1/bootcamps', bootcamps);


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}, in the ${process.env.NODE_ENV} enviroment`);
});