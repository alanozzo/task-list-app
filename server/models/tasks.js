var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var productoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    estatus: { type: String, required: [true, 'El estatus es necesario'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fecha: { type: Date, required: [true, 'La fecha es necesaria'] },
    img: { type: String, required: false }
});


module.exports = mongoose.model('Task', productoSchema);