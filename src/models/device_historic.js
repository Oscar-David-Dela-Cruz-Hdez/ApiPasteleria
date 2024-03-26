import mongoose from 'mongoose';

const historicoSchema  = new mongoose.Schema({
    idDevice: {type: mongoose.Schema.ObjectId, ref: 'Dispositivo', required: true},
    variable: { type: String, required: true },
    valor: { type: Number, required: true },
    fecha: {type:Date,required:true}
});

const Historico = mongoose.model('Historico', historicoSchema );

export default Historico;
