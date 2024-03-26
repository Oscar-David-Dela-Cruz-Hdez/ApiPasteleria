import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { usersSchema } from '../models/users.js';
import { verificarTokenAdmin, verificarTokenUsuario } from '../middlewares/verificarToken.js';



export const authRouter = express.Router();

// Ruta para la autenticación de usuario
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar al usuario por email
        const User = await usersSchema.findOne({ "datosCuenta.email": email });
        if (!User) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Comparar la contraseña
        const passwordMatch = await bcrypt.compare(password, User.datosCuenta.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign({ userId: User._id,rol:User.datosCuenta.rol }, 'secreto', { expiresIn: '1h' });

        res.status(200).cookie('token',token).json({id:User._id,role:User.datosCuenta.rol})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});
authRouter.post('/logout', async (req, res) => {
    res.cookie("token","",{
        expires:new Date(0)
    })
    return res.sendStatus(200);
});
authRouter.get('/user', verificarTokenUsuario, (req, res) => {
    res.json({ message: 'Acceso permitido para usuarios normales' });
});
authRouter.get('/admin', verificarTokenAdmin, (req, res) => {
    res.json({ message: 'Acceso permitido para administradores' });
});