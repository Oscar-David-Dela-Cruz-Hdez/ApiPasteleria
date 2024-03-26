import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
  }
});

//envio del correo electronico a los usuarios
export const enviarCorreo = async (destinatario, tipo,token) => {
  //tipos de correos a enviar
  const tiposDeCorreo = {
      token: {
        asunto: 'Token de recuperación',
        contenido: `Este es su token de recuperación: ${token}`
      },
      cambio: {
        asunto: 'Cambio de contraseña',
        contenido: `Haga click en el siguiente enlace para cambiar su contraseña: ${process.env.URL_FRONT}cambiarPass?token=${token}`
      },
      verificar:{
        asunto: 'Verificación de correo',
        contenido: `Haga click en el siguiente enlace para verificar su correo electrónico: ${process.env.URL_FRONT}verificar?token=${token}`
      }
  };

  //selección del tipo de correo a enviar traido de los parámetros
  const tipoCorreo = tiposDeCorreo[tipo];

  if (!tipoCorreo) {
      throw new Error('Tipo de correo no válido');
  }

  //configuración del email
  const mailOptions = {
      from: process.env.MAIL_USER,
      to: destinatario,
      subject: tipoCorreo.asunto,
      text: tipoCorreo.contenido
  };

  try {
    //envío del email con la configuración indicada anteriormente
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
  }
};
