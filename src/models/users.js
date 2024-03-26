import mongoose from 'mongoose';

export const usersSchema = mongoose.model(
    'Usuario',
    new mongoose.Schema({
        nombre: {
            nombre: { type: String, required: true },
            apP: { type: String, required: true },
            apM: { type: String, required: true },
        },
        telefono: { type: String, required: true, maxlength: 10, minlength: 10,unique:true },
        datosCuenta: {
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true, minlength: 8 },
            preguntaRecuperacion: {
                idPregunta: { type: mongoose.Schema.ObjectId, ref: 'Pregunta', required: true },
                respuesta: { type: String, required: true },
            },
            rol:{type:String, enum:['admin','usuario'],required:true},
            imagenPerfil:{type:String}
        },
        dispositivos: [
            {
                idDispositivo: { type: mongoose.Schema.ObjectId, ref: 'Dispositivo' }
            }
        ]},
        {
            timestamps:true
        }
)
);
