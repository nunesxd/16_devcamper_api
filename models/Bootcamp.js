const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

// Ao criar o Schema, podemos atribuir algumas configurações aos campos, usando o '{}', assim como RegEx (e podemos anexar um texto, caso a expressão seja recusada, assim como no caso de required), se deve ser "trim", tamanho máximo do campo, GeoJSON (biblioteca que permite identificar um endereço geograficamente) etc.
const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
      },
      slug: String,
      description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
      },
      website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
      },
      phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      address: {
        type: String,
        required: [true, 'Please add an address']
      },
      location: {
        // GeoJSON Point
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
      },
      careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
          'Web Development',
          'Mobile Development',
          'UI/UX',
          'Data Science',
          'Business',
          'Other'
        ]
      },
      averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
      },
      averageCost: Number,
      photo: {
        type: String,
        default: 'no-photo.jpg'
      },
      housing: {
        type: Boolean,
        default: false
      },
      jobAssistance: {
        type: Boolean,
        default: false
      },
      jobGuarantee: {
        type: Boolean,
        default: false
      },
      acceptGi: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
},{
  // Abaixo, estamos configurando o uso dos 'virtuals', que é uma forma de 'populate' reverso, ou seja, iremos mostrar os dados dos courses dentro dos bootcamps:
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

/* Inicialização do Slugify, que nos permite converter o nome do bootcamp informado no schema acima.
OBS: É importante mencionar que estamos utilizando um middleware (ou hook) do mongoose, o 'pre', que nos permite modificar os campos o schema, neste caso, antes de salvá-los na base. Existem vários outros middlewares disponíveis para uso.
OBS 2: Usamos o 'function()' para guardar a referência do 'this'.*/
BootcampSchema.pre('save', function(next) {
  // Neste middleware, temos acesso a todos os campos do schema, e usamos o novo slugify para criar o nosso slug automático, onde podemos inserir algumas opções, como o lowercase:
  this.slug = slugify(this.name, {lower: true});
  next();
});

// Inicializa o Geocode, e preenche automaticamente o campo 'location':
BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  // Queremos transformar nosso campo em um objeto do Geocode, com as suas opções:
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  // Como definimos o endereço já formatado acima, não precisamos mais do endereço providenciado pelo cliente. Lembrando que o MongoDB é NoSQL, se um campo não for informado, e este não for necessário, ele simplesmente não é adicionado ao banco:
  this.address = undefined;

  next();
});

// Introdução do 'Cascade Delete', uma forma de garantirmos que todos os respectivos bootcamps sejam deletados caso os cursos sejam deletados:
BootcampSchema.pre('remove', async function (next) {
  console.log(`Cursos sendo deletados do bootcamp ${this._id}.`);
  await this.model('Course').deleteMany({bootcamp: this._id});
  next();
});

// Virtuals (populate inverso). O primeiro 'courses' é só como queremos que apareça no resultado, as opções seguintes que são importantes para o link entre os modelos:
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false // Queremos um array.
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);