const mongoose = require('mongoose');

/* Como o connect do mongoose retorna uma promise, poderíamos usar o .then(), mas nesta outra estratégia, podemos pedir para o Node esperar o retorno do connect, evitando problemas de conexão (que no caso não deveriam acontecer muito, pois o banco será local).
Um outro problema que teríamos, seria em lidar com Unhandled errors das promises, poderíamos usar um try/catch no connectDb abaixo, mas optamos por lidar com os erros no server.js.*/
const connectDb = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`MongoDb Connected ! ${conn.connection.host}`);
}

module.exports = connectDb;