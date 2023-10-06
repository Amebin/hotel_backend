import mongoose from 'mongoose'
import { Router } from 'express'

import imageModel from '../models/image.model.js'

export const imagesRoutes = ()  => {
    const router = Router()

    router.get('/', async (req, res) => {
        try {
            const images = await imageModel.find()
            res.status(200).send({
                status: "OK",
                data: images
            });
        } catch (error) {
            res.status(500).send({ status: 'ERR', data: error.message })
        }
    })

    router.get('/:id', async (req, res) => {
        try {
            const image = await imageModel.findById(req.params.id)
            if (!image) {
                res.status(404).send({ status: 'ERR', data: 'La imagen no existe' })
            } else {
                res.status(200).send({
                    status: "OK",
                    data: image
                });
            }
        } catch (error) {
            res.status(500).send({ status: 'ERR', data: error.message })
        }
    })

    router.post('/', async (req, res) => {
        try {
            const { url, title, description } = req.body
            const newImage = await imageModel.create({
                url,
                title,
                description
            })
            res.status(201).send({
                status: "OK",
                data: newImage
            });
        } catch (error) {
            res.status(500).send({ status: 'ERR', data: error.message })
        }
    })

    router.put('/:id', async (req, res) => {
        try {
            const { url, title, description } = req.body
            const image = await imageModel.findById(req.params.id)
            if (!image) {
                res.status(404).send({ status: 'ERR', data: 'La imagen no existe' })
            } else {
                image.url = url
                image.title = title
                image.description = description
                await image.save()
                res.status(200).send({
                    status: "OK",
                    data: image
                });
            }
        } catch (error) {
            res.status(500).send({ status: 'ERR', data: error.message })
        }
    })

    router.delete('/:id', async (req, res) => {
        try {
            const image = await imageModel.findById(req.params.id)
            if (!image) {
                res.status(404).send({ status: 'ERR', data: 'La imagen no existe' })
            } else {
                await image.remove()
                res.status(200).send({
                    status: "OK",
                    data: image
                });
            }
        } catch (error) {
            res.status(500).send({ status: 'ERR', data: error.message })
        }
    })

    return router
}
