import { Router } from 'express';
const imagesRouter = Router();
import path from 'path';
import { __dirname } from '../../app.js';

imagesRouter.get('/products/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'src', 'assets', 'products', imageName);
  res.sendFile(imagePath);
});

imagesRouter.get('/users/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'src', 'assets', 'users', imageName);
  res.sendFile(imagePath);
});

export { imagesRouter };
