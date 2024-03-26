import mongoose from "mongoose";

export const connectDB= async ()=>{
    try {
        // coneccion con la base de dato
        await mongoose.connect(process.env.MONGO_ATLAS_URI)
        .then(() => console.log('Conectado a la base de datos'))
        .catch(error => console.log(error))
    } catch (error) {
        console.error(error);
    }
};
