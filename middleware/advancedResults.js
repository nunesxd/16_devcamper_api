const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };

    // Adiciona o id do bootcamp a nossa query, caso esse seja providenciado:
    if (req.params.bootcampId) {
        reqQuery.bootcamp = req.params.bootcampId;
    }

    // Remoção dos parâmetros que não queremos em nosso find, estas serão tratadas separadamente mais abaixo:
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(field => delete reqQuery[field]);

    let queryStr = JSON.stringify(reqQuery);

    // Estamos pegando os comandos abaixo e colocando um '$' antes, ex: gt - greater than, gte - grater than and equal.
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => '$' + match);
    
    // Usamos abaixo o 'virtuals' (reverse populate), para trazer os dados dos cursos para o bootcamp:
    query = model.find(JSON.parse(queryStr));
    
    // Para os casos de SELECT, os campos a serem selecionados serão separados com uma ',', e não por espaços (que é necessário para o mongoose), para isso:
    if(req.query.select) {
        const selectFields = req.query.select.replace(',', " ");
        query = query.select(selectFields); // 'query' é um objeto do mongoose contendo bootcamps, selecionamos apenas os campos contidos no 'select';
    }

    // Para os casos de SORT:
    if(req.query.sort) {
        const sortFields = req.query.sort.replace(',', " ");
        query = query.sort(sortFields);
    } else {
        // Usaremos um sort padrão, por data:
        // OBS: O '-' é para descending, '+' para ascending.
        query = query.sort('-createdAt');
    }

    // Paginação:
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page-1) * limit; // caso tenhamos mais paginas, separemos os recursos adequadamente por elas.
    const endIndex = page * limit;
    const totalDoc = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate) {
        query = query.populate(populate)
    }

    const results = await query;

    // Resultado da paginação, que ficará dentro do JSON de resultado abaixo:
    const pagination = {};

    // Se tiver uma próxima página, mostre:
    if(endIndex < totalDoc) {
        pagination.nextPage = {
            page: page + 1,
            limit,
            totalDoc
        }
    }

    // Se tiver uma página anterior, mostre:
    if(startIndex > 0) {
        pagination.prevPage = {
            page: page - 1,
            limit,
            totalDoc
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
}

module.exports = advancedResults;