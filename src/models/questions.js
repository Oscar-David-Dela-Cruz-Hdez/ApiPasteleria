import mongoose from 'mongoose';

export const questionsSchema = mongoose.model(
    'Pregunta',
    mongoose.Schema({
        pregunta: { type: String, required: true }
    })
);

