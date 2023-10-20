import mongoose from 'mongoose'
import { Router } from 'express'

import roomModel from '../models/rooms.models.js'
import reservationModel from '../models/reserved.models.js'
import { verifyToken, checkRoles, checkRequired } from '../middlewares/rooms.middleware.js'

import { body, validationResult } from 'express-validator'

export const reservedRoutes = ()  => {
    const router = Router()

    router.get('/reservation', verifyToken, async (req, res) => {
        const userId = req.loggedInUser.uid
                
        const reserved = await reservationModel.find({ userId: userId })
        res.status(200).send({ status: 'OK', data: reserved })       
    })

    router.get('/admin/reservations', verifyToken, checkRoles(['admin']), async (req, res) => {
        const reserved = await reservationModel.find()
        res.status(200).send({ status: 'OK', data: reserved })
    })

    router.get('/admin/onereservation/:rid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            if (mongoose.Types.ObjectId.isValid(req.params.rid)) {
                const reserved = await reservationModel.findById(req.params.rid)

                if (reserved === null) {
                    res.status(404).send({ status: 'ERR', data: 'No existe una reserva con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: reserved })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    }
    )

    router.delete('/admin/deletereservation/:rid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            const id = req.params.rid
            if (mongoose.Types.ObjectId.isValid(id)) {
                const reservedToDelete = await reservationModel.findOneAndDelete({ _id: id })

                if (!reservedToDelete) {
                    res.status(404).send({ status: 'ERR', data: 'No existe reserva con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: reservedToDelete })
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
