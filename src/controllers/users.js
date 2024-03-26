
import { usersSchema } from '../models/users.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const saltRounds = 10;
// Operación de Crear Usuario
export const crearUsuario = async (req, res) => {
    try {
        console.log(req.body)
        const { datosCuenta: { password, ...restDatosCuenta }, ...restUserData } = req.body;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = new usersSchema({
            ...restUserData,
            datosCuenta: {
                ...restDatosCuenta,
                password: hashedPassword,
                rol: 'usuario'
            }
        });

        await nuevoUsuario.save();

        jwt.sign({ id: nuevoUsuario._id, email: nuevoUsuario.datosCuenta.email, rol: nuevoUsuario.datosCuenta.rol }, 'secret', { expiresIn: "1d" }, (err, token) => {
            if (err) res.status(500).json({ message: err.message });
            res.status(201).cookie('token', token)
            res.json({ id: nuevoUsuario._id, email: nuevoUsuario.datosCuenta.email, role: nuevoUsuario.datosCuenta.rol })
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Operación de Leer todos los Usuarios
export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await usersSchema.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Operación de Leer un Usuario por ID
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await usersSchema.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Operación de Actualizar Usuario por ID
export const actualizarUsuario = async (req, res) => {
    try {
        const { datosCuenta: { password, ...restDatosCuenta }, ...restUserData } = req.body;

        // Verificar si se proporcionó una nueva contraseña
        if (password) {
            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            req.body.datosCuenta.password = hashedPassword;
        }

        // Realizar la actualización manual
        const usuario = await usersSchema.findByIdAndUpdate(
            req.params.id,
            {
                ...restUserData,
                datosCuenta: {
                    ...restDatosCuenta,
                    ...req.body.datosCuenta
                }
            },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Operación de Eliminar Usuario por ID
export const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await usersSchema.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
