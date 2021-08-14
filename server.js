const express = require('express');
const dotenv = require('dotenv');
const bootcamps = require('./routes/bootcamps'); // Arquivo de rotas.
//const logger = require('./middleware/logger'); // Apenas um exemplo de log, simples demonstração de middleware.
const morgan = require('morgan');
const connectDb = require('./config/db');

// Carregando as variáveis do projeto:
dotenv.config({ path: './config/config.env' });

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


const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}, in the ${process.env.NODE_ENV} enviroment`);
});

// Lidando com os problemas de Unhandled das promises, como por exemplo, conexão da base de dados:
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Fecha o servidor e o processo:
    server.close(() => process.exit(1));
});