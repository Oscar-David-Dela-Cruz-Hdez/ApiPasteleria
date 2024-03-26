import { Router } from 'express'
import { productsSchema } from '../models/products.js'

export const productRouter = Router()

productRouter.get('', (req, res) => {
    productsSchema.find()
        .then(data => res.json(data))
        .catch(error => res.status(400).json({ message: error }))
})

//buscar una pregunta por id
productRouter.get('/:id',(req,res)=>{
    const {id}=req.params
    productsSchema.findById(id)
    .then(data => {
        if(!data)
            res.status(404).json({message:'Producto no encontrado'})
        else
            res.json(data)
    })
    .catch(error=>res.status(400).json({message:error}))
})