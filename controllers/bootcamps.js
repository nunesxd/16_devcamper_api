/* Módulos middleware que irão conter a lógica de nossos routes:
Optamos por utilizar um conceito de versionamento, onde poderíamos continuar usando uma versão anterior simultâneamente.*/

// @desc    Obtem todos os bootcamps;
// @route   GET /api/v1/bootcamps;
// @access  Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, msg: 'Show all bootcamps' });
}

// @desc    Obtem apenas um bootcamp;
// @route   GET /api/v1/bootcamps/:id;
// @access  Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Get bootcamp ID: ${req.params.id}` });
}

// @desc    Cria um bootcamp;
// @route   POST /api/v1/bootcamps;
// @access  Private
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: 'Create new bootcamp' });
}

// @desc    Atualiza um bootcamp;
// @route   PUT /api/v1/bootcamps/:id;
// @access  Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Update bootcamp ID: ${req.params.id}` });
}

// @desc    Deleta um bootcamp;
// @route   DELETE /api/v1/bootcamps/:id;
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Delete bootcamp ID: ${req.params.id}` });
}