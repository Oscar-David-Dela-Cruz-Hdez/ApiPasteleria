import mongoose from 'mongoose';

export const productsSchema = mongoose.model(
  'Producto',
  mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number },
    tipo: { type: String, required: true },
    imagen: { type: String }
  })
);

