import mongoose from 'mongoose'
import { Router } from 'express'

import roomModel from '../models/rooms.models.js'
import reservationModel from '../models/reserved.models.js'
import { avoidConsecutiveSpaces, isIsoDate, verifyToken, checkRoles, checkRequired } from '../middlewares/rooms.middleware.js'
import getDates from '../helpers/date.post.js'
import { body, validationResult } from 'express-validator'

export const roomsRoutes = ()  => {
    const router = Router()

    const validateCreateFields = [
        body('title').isLength({ min: 2, max: 32 }).withMessage('El título debe tener entre 2 y 32 caracteres'),
        body('price').isNumeric().withMessage('El precio debe ser numérico'),
        body('images').isArray({ min: 1, max: 100 }).withMessage('Debes proporcionar al menos una imagen'),
        body('description').isLength({ min: 2, max: 50 }).withMessage('La descripción debe tener entre 2 y 50 caracteres'),
       /*  body('avaliableDates').isArray({ min: 1 }).withMessage('Debes proporcionar al menos una fecha disponible'),
        body('avaliableDates.*').custom(isIsoDate), */
        body('numberRoom').isNumeric().withMessage('El número de habitación debe ser numérico'),
        body('tipeRoom').isLength({ min: 2, max: 32 }).withMessage('El tipo de habitación debe tener entre 2 y 32 caracteres'),
        body('size').isLength({ min: 2, max: 32 }).withMessage('El tamaño de la habitación debe tener entre 2 y 32 caracteres'),
        body('capacity').isNumeric().withMessage('La capacidad de la habitación debe ser numérico'),
    ]    

    router.get('/', verifyToken, async (req, res) => {
        const rooms = await roomModel.find()
        res.status(200).send({ status: 'OK', data: rooms })
    })

    router.get('/one/:rid', verifyToken, async (req, res) => {
        try {
            if (mongoose.Types.ObjectId.isValid(req.params.rid)) {
                const room = await roomModel.findById(req.params.rid)

                if (room === null) {
                    res.status(404).send({ status: 'ERR', data: 'No existe una habitacion con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: room })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })    

    router.put('/reserved/:rid', verifyToken, async (req, res) => {
        try {
            const room = await roomModel.findById(req.params.rid)
            if (!room) {
                return res.status(404).json({ status: 'ERR', data: 'La habitación no existe' })
            }
            
            if (!room.avaliableDates.includes(req.body.date)) {
                return res.status(400).json({ status: 'ERR', data: 'La fecha no está disponible' })
            }
    
            const avaliableDates = room.avaliableDates
            const { date } = req.body
            const startDate = new Date(avaliableDates.at(-1))
            const dateArray = getDates(startDate)
            const formattedDateArray = dateArray.map((date) => date.toISOString().split('T')[0])
            const index = avaliableDates.indexOf(date)
            if (index > -1) {
                avaliableDates.splice(index, 1)
            }
            
            const newArrayDates = [ ...avaliableDates, ...formattedDateArray]
            const updateData = newArrayDates
            const uno = await roomModel.findOneAndUpdate({ _id: req.params.rid }, { $set: {avaliableDates:updateData} }, { new: true })
            console.log(uno)
            const newReservation = { userId: req.body.id, roomId: req.params.rid, date }
            const process = await reservationModel.create(newReservation)
            //agregar fragmento de codigo que ligue el id de reserva a reservas del usuario

            res.status(201).json({ status: 'Created', data: process })
        } catch (err) {
            res.status(500).json({ status: 'ERR', data: err.message })
        }
    })

   /*  avoidConsecutiveSpaces,  checkRequired(['title', 'price']),validateCreateFields,*/
    router.post('/admin', verifyToken, checkRoles(['admin']), async (req, res) => {
        if (validationResult(req).isEmpty()) {
            try {
                const { title, price, images, description, numberRoom, tipeRoom, size, capacity } = req.body
                const existingRoom = await roomModel.findOne({ numberRoom })
                if (existingRoom) {
                    return res.status(400).json({ status: 'ERR', data: 'Ya existe una habitación con ese número' }) 
                }
                const limitDays = 20
                const dateArray = getDates(limitDays)
                const formattedDateArray = dateArray.map((date) => date.toISOString().split('T')[0])
                
                const newRoom = { title, price, images, description, avaliableDates: formattedDateArray, numberRoom, tipeRoom, size, capacity }

                const process = await roomModel.create(newRoom)
                
                res.status(201).send({ status: 'Created', data: process, message: dateArray })
            } catch (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            }
        } else {
            res.status(400).send({ status: 'ERR', data: validationResult(req).array() })
        }
    })

    // avoidConsecutiveSpaces validateCreateFields,
    router.put('/admin/:rid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            const id = req.params.rid
            const updateData = req.body
    
            const validationErrors = validationResult(req)
            if (!validationErrors.isEmpty()) {
                return res.status(400).json({ status: 'ERR', data: validationErrors.array() })
            }
    
            if (mongoose.Types.ObjectId.isValid(id)) {
                const roomToModify = await roomModel.findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true })
    
                if (!roomToModify) {
                    res.status(404).send({ status: 'ERR', data: 'No existe habitación con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: roomToModify })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    router.delete('/admin/:rid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            const id = req.params.rid
            if (mongoose.Types.ObjectId.isValid(id)) {
                const roomToDelete = await roomModel.findOneAndDelete({ _id: id })

                if (!roomToDelete) {
                    res.status(404).send({ status: 'ERR', data: 'No existe tarjeta con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: roomToDelete })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    return router
}

