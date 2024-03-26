import express, { json } from 'express'
import dotenv from "dotenv";
import cors from 'cors';
import { questionRouter } from './src/routes/questions.js';
import { usersRouter } from './src/routes/users.js';
import { authRouter } from './src/routes/auth.js';
import { verificarToken, verificarTokenAdmin, verificarTokenUsuario } from './src/middlewares/verificarToken.js';
import { userRouter } from './src/routes/user.js';
import { recuperacionRouter } from './src/routes/recuperacion.js';
import { imagesRouter } from './src/routes/images.js';
import path from 'path';
import { productRouter } from './src/routes/products.js';
import cookieParser from 'cookie-parser';
import { deviceRouter } from './src/routes/device.js';
export const __dirname = import.meta.dirname;
dotenv.config();
const app = express()

app.use(json())
app.disable('x-powered-by')
app.use(express.static(path.join(__dirname, 'src', 'assets')));
app.use(cookieParser())

const ACCEPTEP_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:4200'
]

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || ACCEPTEP_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
app.use(cors());
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send('<h1>Hola mundo</h1>')
})


app.use('/usuarios', usersRouter)
app.use('/productos', productRouter)
app.use('/questions', questionRouter)
app.use('/auth', authRouter)
app.use('/user', verificarTokenUsuario, userRouter)
app.use('/admin', verificarTokenAdmin)
app.use('/recovery', verificarToken, recuperacionRouter)
app.use('/images', imagesRouter)
app.use('/devices', deviceRouter)
// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
    next()
});

export default app;