// Biblioteca responsável por identificar no mapa, os endereços informados no schema. Abaixo seguimos conforme informado pelo próprio site do Geocoder, com as configurações da ferramenta:

const NodeGeocoder = require('node-geocoder');

const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;