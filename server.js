const dotenv = require('dotenv');
// Carregando as variáveis do projeto:
dotenv.config({ path: './config/config.env' });

const express = require('express');
const bootcamps = require('./routes/bootcamps'); // Arquivo de rotas.
const courses = require('./routes/courses');
const morgan = require('morgan');
const connectDb = require('./config/db');
const errorHandler = require('./middleware/error');
//const logger = require('./middleware/logger'); // Apenas um exemplo de log, simples demonstração de middleware.

// Conexão a base de dados:
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;

//app.use(logger);
// Abaixo usamos uma biblioteca de log mais completa:
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser, inicializador:
app.use(express.json());

// Configuração das rotas, assim não precisamos deixar a URL completa lá:
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// Error handler customizado, é importante que ele seja o último, pois o 'use' cria uma fila de middlewares para serem executados, e o errorHandler deve ser capaz de pegar o erro de qualquer função executada anteriormente:
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}, in the ${process.env.NODE_ENV} enviroment`);
});

// Lidando com os problemas de Unhandled das promises, como por exemplo, conexão da base de dados:
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Fecha o servidor e o processo:
    server.close(() => process.exit(1));
});