/* Este módulo nos permitirá remover a repetição dos try/catch's que utilizamos em nossos módulos presentes nos controllers.
Nos utilizamos do Promise (método Javascript async nativo) para executar a função (no caso a função com await do controller), se caso essa falhar, irá retornar uma promise com falha, que será manipulada pelo catch abaixo.
Artigo explicando as etapas:
https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016*/

const asyncHandler = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next)
    
module.exports = asyncHandler;