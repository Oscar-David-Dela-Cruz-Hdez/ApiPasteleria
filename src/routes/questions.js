import { Router } from 'express'
import { questionsSchema } from '../models/questions.js'

export const questionRouter = Router()

questionRouter.get('', (req, res) => {
    questionsSchema.find()
        .then(data => res.json(data))
        .catch(error => res.status(400).json({ message: error }))
})

//buscar una pregunta por id
questionRouter.get('/:id',(req,res)=>{
    const {id}=req.params
    questionsSchema.findById(id)
    .then(data => {
        if(!data)
            res.status(404).json({message:'Pregunta no encontrada'})
        else
            res.json(data)
    })
    .catch(error=>res.status(400).json({message:error}))
})