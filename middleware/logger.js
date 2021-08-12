/* Abaixo criamos um middleware mais simples, de log. 
Lembrando que um middleware recebe o request e response dos métodos HTTP, pois ele os intercepta, por isso o 'middle' do nome. 
Para utilizarmos, poderíamos criar uma variável e passá-la para as rotas individuais que a utilizariam, ou poderíamos usar o 'app.use()', que iria vincular o middleware a todas as rotas:*/

const logger = (req, res, next) => {
    req.hello = 'Hello World'; // Esta variável poderá ser acessada em todos as rotas que tiverem o middleware.
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next(); // Um middleware precisa saber quando deve passar para o próximo middleware, por isso o next().
};

module.exports = logger;