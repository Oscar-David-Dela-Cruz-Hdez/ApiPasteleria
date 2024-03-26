import { Router } from 'express'
import { usersSchema } from '../models/users.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { questionsSchema } from '../models/questions.js';
import { enviarCorreo } from '../utilities/mailer.js';
export const recuperacionRouter = Router()

//verifica si el usuario está en el proceso de recuperar su cuenta
recuperacionRouter.post('/verificar', async (req, res) => {
  try {
    const { recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    res.status(200).send(true);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

//regresa la pregunta de recuperación del usuario
recuperacionRouter.post('/question', async (req, res) => {
  try {
    const { userId, recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    // Encuentra al usuario por ID
    const usuario = await usersSchema.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encuentra la pregunta asociada al usuario por el ID de la pregunta en el usuario
    const pregunta = await questionsSchema.findById(usuario.idPregunta);

    if (!pregunta) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    // Retorna la pregunta asociada al usuario
    res.json(pregunta);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

//verifica la respuesta a la pregunta secreta del usuario
recuperacionRouter.post('/question/verify', async (req, res) => {
  try {
    const { userId, recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    const {pregunta,respuesta}=req.body;
    // Encuentra al usuario por ID
    const usuario = await usersSchema.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const preguntaU = usuario.idPregunta
    const respuestaU = usuario.respuesta
    if(pregunta===preguntaU.toString()&&respuesta.toLowerCase()===respuestaU){
      res.status(200).json({message: 'Respuesta a la pregunta secreta correcta'})
    }else{
      res.status(403).json({message: 'Respuesta incorrecta'})
    }

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

//regresa el email del usuario
recuperacionRouter.post('/email', async(req,res)=>{
  try {
    const { userId, recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    // Encuentra al usuario por ID
    const usuario = await usersSchema.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const email = usuario.email;

    // Retorna la pregunta asociada al usuario
    res.json(email);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
})

//verifica el token de recuperación del usuario
recuperacionRouter.post('/token/verify', async (req,res)=>{
  try {
    const { userId, recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    // Encuentra al usuario por ID
    const usuario = await usersSchema.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const {token}=req.body
    const decodedToken = jwt.verify(token, 'secreto');
    const{recToken}=decodedToken;
    if(!recToken){
      return res.status(400).json({message:'No es un token de recuperación'})
    }
    return res.status(200).json({message:'Token de recuperación válido'})
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
})

//modifica la contraseña del usuario
recuperacionRouter.post('/password', async (req,res)=>{
  try {
    const { userId, cambiarPass } = req.userData;
    if (!cambiarPass) {
      return res.status(400).json({ message: 'El usuario no va a cambiar su contraseña' })
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    usersSchema.findByIdAndUpdate(userId, { $set: { password: hashedPassword } }, { new: true })
      .then(data => {
        if (!data)
          res.status(404).json({ message: 'Usuario no encontrado' });
        else
          res.json(data);
      })
      .catch(error => res.status(500).json({ message: error }));
    
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
})

//envio de correos para el usuario
//email de recuperación
recuperacionRouter.get('/email/:tipo', async(req,res)=>{
  try {
    const { userId, recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    // Encuentra al usuario por ID
    const usuario = await usersSchema.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const email = usuario.email;
    const { tipo } = req.params;
    const token = jwt.sign({ userId: usuario._id, cambiarPass:true }, 'secreto', { expiresIn: '1h' });
    try {
        await enviarCorreo(email, tipo,token);
        res.status(200).json({ message: 'Correo electrónico enviado correctamente'});
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el correo electrónico'});
    }
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
})

//token de recuperación
recuperacionRouter.get('/token/:tipo', async (req,res)=>{
  try {
    const { userId, recuperar } = req.userData;
    if (!recuperar) {
      return res.status(400).json({ message: 'El usuario no va a recuperar su cuenta' })
    }
    // Encuentra al usuario por ID
    const usuario = await usersSchema.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const { tipo } = req.params;
    const email = usuario.email;

    const token = jwt.sign({ userId: usuario._id, recToken:true }, 'secreto', { expiresIn: '1h' });
    try {
        await enviarCorreo(email, tipo,token);
        res.status(200).json({ message: 'Token enviado correctamente'});
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el token'});
    }
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
})