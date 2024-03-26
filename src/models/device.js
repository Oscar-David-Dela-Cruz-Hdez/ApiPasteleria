import mongoose from 'mongoose';

const dispositivoSchema = new mongoose.Schema({
    label:{type:String},
    pir: { type: Number, required: true },
    rfid: { type: Number, required: true },
    servo: { type: Number, required: true },
    camara: { type: Date, required: true },
    keypad: { type: Number, required: true },
    estado: { type: String, required: true },
}, { timestamps: true });

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

export default Dispositivo;
