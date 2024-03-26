import { Router } from "express";
import Historico from "../models/device_historic.js";
import Dispositivo from "../models/device.js";
import * as mongoose from "mongoose";
import { usersSchema } from "../models/users.js";
export const deviceRouter = Router()
// Ruta para manejar la actualización de datos
deviceRouter.post('/actualizarDatos', async (req, res) => {
    try {
        const { device_label, pir, rfid, servo, camara, keypad, estado} = req.body;
        //65ec920163a4ecc05c177e18
        // Verifica la existencia del dispositivo en la base de datos

        const existingDevice = await Dispositivo.findOne({ _id: device_label });
        if (!existingDevice) {
            return res.status(404).json({ message: 'La tarjeta no existe' });
        }

        // Actualiza los datos en el dispositivo si están presentes en la solicitud
        if (pir !== undefined) {
            existingDevice.pir = pir;
        }

        if (rfid !== undefined) {
            existingDevice.rfid = rfid;
        }
        if (servo !== undefined) {
            existingDevice.servo = servo;
        }
        if (camara !== undefined) {
            existingDevice.camara = camara;
        }
        if (keypad !== undefined) {
            existingDevice.keypad = keypad;
        }
        if (estado !== undefined) {
            existingDevice.estado = estado;
        }

        await existingDevice.save();

        // Registra en el historial si los datos están presentes en la solicitud
        if (pir !== undefined) {
            const historicopir = new Historico({ idDevice: existingDevice._id, variable: 'pir', valor: pir, fecha: new Date() });
            await historicopir.save();
        }

        if (rfid !== undefined) {
            const historicorfid = new Historico({ idDevice: existingDevice._id, variable: 'rfid', valor: rfid, fecha: new Date() });
            await historicorfid.save();
        }
        if (servo !== undefined) {
            const historicoservo = new Historico({ idDevice: existingDevice._id, variable: 'servo', valor: servo, fecha: new Date() });
            await historicoservo.save();
        }
        if (camara !== undefined) {
            const historicocamara = new Historico({ idDevice: existingDevice._id, variable: 'camara', valor: camara, fecha: new Date() });
            await historicocamara.save();
        }

        if (keypad !== undefined) {
            const historicokeypad = new Historico({ idDevice: existingDevice._id, variable: 'keypad', valor: keypad, fecha: new Date() });
            await historicokeypad.save();
        }
        if (estado !== undefined) {
            const historicoestado = new Historico({ idDevice: existingDevice._id, variable: 'estado', valor: estado, fecha: new Date() });
            await historicoestado.save();
        }

        // Retorna los datos actualizados
        const updatedData = await Dispositivo.findOne({ _id: device_label }, { pir: 1, rfid: 1, servo: 1, camara:1, keypad: 1, estado: 1, _id: 0 });


        return res.json(updatedData);
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
//crear un nuevo dispositivo
deviceRouter.post('', async (req, res) => {
    try {
        const dispositivo = new Dispositivo
        dispositivo.pir = 0
        dispositivo.rfid = 0
        dispositivo.servo = 0
        dispositivo.camara = 0
        dispositivo.keypad = 0
        dispositivo.estado = 0
        dispositivo.asignado = false
        await dispositivo.save();
        res.status(201).json({ message: 'Dispositivo creado con exito' })
    } catch (error) {

    }
})
//Obtener todos los dispositivos
deviceRouter.get('', async (req, res) => {
    try {
        const dispositivos = await Dispositivo.find();
        res.status(200).json(dispositivos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//obtener los usuarios (regulares) para asignarles dispositivos
deviceRouter.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await usersSchema.find({ 'datosCuenta.rol': 'usuario' });
        res.status(200).json(usuarios)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})  

//Obtener un dispositivo por id
deviceRouter.get('/:id', async (req, res) => {
    try {
        const dispositivo = await Dispositivo.findById(req.params.id);
        const { id } = req.params;

        const ultimosValores = await Historico.aggregate([
            {
                $match: {
                    idDevice: mongoose.Types.ObjectId.createFromHexString(id),
                },
            },
            {
                $sort: {
                    fecha: -1,
                },
            },
            {
                $group: {
                    _id: '$variable',
                    ultimoValor: { $first: '$valor' },
                    ultimaFecha: { $first: '$fecha' },
                },
            },
        ]);
        res.status(200).json({ dispositivo: dispositivo, variables: ultimosValores });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//obtener los dispositivos de un usuario (usuario normal)
deviceRouter.post('/user', async (req, res) => {
    try {
        const { id } = req.body
        const usuario = await usersSchema.findById(id).populate('dispositivos.idDispositivo');
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario.dispositivos)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//asignar un dispositivo a un usuario
deviceRouter.post('/user/:id', async (req, res) => {
    try {
        const { dispositivoID } = req.body
        const usuario = await usersSchema.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        usuario.dispositivos.push({ idDispositivo: dispositivoID });
        await usuario.save();
        const dispositivo = await Dispositivo.updateOne({ _id: dispositivoID }, { asignado: true });

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//eliminar un dispositivo
deviceRouter.delete('/:id', async (req, res) => {
    try {
        const deviceId = req.params.id;
        const users = await usersSchema.find({ 'dispositivos.idDispositivo': deviceId });
        for (const user of users) {
            user.dispositivos = user.dispositivos.filter(dispositivo => dispositivo.idDispositivo.toString() !== deviceId);

            await user.save();
        }
        const device = await Dispositivo.findByIdAndDelete(deviceId);
        if (!device) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
        res.status(200).json({ message: 'Dispositivo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


//cambiar la etiqueta de un dispositivo
deviceRouter.post('/:id/label', async (req, res) => {
try {
    const { id } = req.params;
    const { label } = req.body;
    // Verifica si el dispositivo existe
    const dispositivo = await Dispositivo.findById(id);
    if (!dispositivo) {
        return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // Actualiza la etiqueta del dispositivo
    dispositivo.label = label;
    await dispositivo.save();

    res.status(200).json({ message: 'Etiqueta actualizada correctamente' });
} catch (error) {
    res.status(500).json({ error: error.message });
    }
});