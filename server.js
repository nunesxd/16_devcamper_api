const dotenv = require('dotenv');
// Carregando as variáveis do projeto:
dotenv.config({ path: './config/config.env' });

const express = require('express');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss_clean = require('xss-clean');
const rate_limit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const bootcamps = require('./routes/bootcamps'); // Arquivo de rotas.
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
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

app.use(fileupload());

// Manipulação de cookies:
app.use(cookieParser());

// Sanitização dos dados:
app.use(mongoSanitize());

// Configuração de headers de segurança:
app.use(helmet());

// Proteção contra cross site scripting:
app.use(xss_clean());

// Limitação de requests para o servidor:
const limiter = rate_limit({
    // Tempo em minutos, neste caso 10 min:
    windowMs: 10 * 60 * 1000,
    // Máximos de requests permitidos:
    max: 100
});

app.use(limiter);

// Proteção contra HPP (Http Parameter Polution):
app.use(hpp());

// Possibilita CORS - Acesso de outras origens:
app.use(cors());

// Arquivos estáticos:
app.use(express.static(path.join(__dirname, 'public')));

// Configuração das rotas, assim não precisamos deixar a URL completa lá:
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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