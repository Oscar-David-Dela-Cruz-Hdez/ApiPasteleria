import { Router } from 'express'
import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuarioPorId, obtenerUsuarios } from '../controllers/users.js';


export const usersRouter = Router();

usersRouter.get('', obtenerUsuarios);
usersRouter.post('', crearUsuario);
usersRouter.get('/:id', obtenerUsuarioPorId);
usersRouter.put('/:id', actualizarUsuario);
usersRouter.delete('/:id', eliminarUsuario);


