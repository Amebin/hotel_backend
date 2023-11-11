import mongoose from "mongoose"
import { Router } from "express"
import userModel from "../models/user.models.js"
import { body, validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { createHash, filterData, checkRequired, checkReadyLogin, isValidPassword, verifyToken, checkRoles, avoidConsecutiveSpaces, checkEmpty } from "../middlewares/user.middleware.js"

export const userRoutes = () => {
    const router = Router()

    const validateCreateFields = [
        body("firstName")
            .isLength({ min: 2, max: 32 })
            .withMessage("El nombre debe tener entre 2 y 32 caracteres"),
        body("lastName")
            .isLength({ min: 2, max: 32 })
            .withMessage("El apellido debe tener entre 2 y 32 caracteres"),
        body("email")
            .isEmail()
            .withMessage("Debes proporcionar un email válido"),
        body("password")
            .isLength({ min: 8, max: 32 })
            .withMessage("La contraseña debe tener entre 8 y 32 caracteres"),
        body("phone")
            .isNumeric()
            .withMessage("El celular debe ser de 10 digitos"),
    ]

    const validateLoginFields = [
        body("email")
            .isEmail()
            .withMessage("Debes proporcionar un email válido"),
        body("password")
            .isLength({ min: 8, max: 32 })
            .withMessage("La contraseña debe tener entre 8 y 32 caracteres"),
    ]

    router.get("/", verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10

            const skip = (page - 1) * limit

            const users = await userModel.find()
                .skip(skip)
                .limit(limit)

            const totalCount = await userModel.countDocuments()
            const totalPages = Math.ceil(totalCount / limit)
            
            res.status(200).send({
                status: "OK",
                data: users,
                page: page,
                limit: limit,
                total: totalCount,
                totalPages: totalPages,
            })
        } catch (error) {
            res.status(500).send({ status: "ERR", data: error.message })
        }
    })


    router.get('/one/:uid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            if (mongoose.Types.ObjectId.isValid(req.params.uid)) {
                const user = await userModel.findById(req.params.uid)

                if (user === null) {
                    res.status(404).send({ status: 'ERR', data: 'No existe usuario con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: filterData(user._doc, ['password']) })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })


    router.post("/create", validateCreateFields, async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({ status: "ERR", data: errors.array() })
        }

        try {
            const existingUser = await userModel.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).send({ status: "ERR", data: "Este correo electrónico ya está registrado." });
            }

            const hashedPassword = createHash(req.body.password)
            const user = await userModel.create({ ...req.body, password: hashedPassword })
            res.status(201).send({ status: "OK", data: user })
        } catch (err) {
            res.status(500).send({ status: "ERR", data: err.message })
        }
    }
    )

    router.post('/login', checkRequired(['email', 'password']), validateLoginFields, checkReadyLogin, async (req, res) => {
        if (validationResult(req).isEmpty()) {
            try {
                const foundUser = res.locals.foundUser

                if (!foundUser) {
                    return res.status(401).send({ status: 'ERR', data: 'Usuario no encontrado' })
                }
                if (foundUser.active === false) {
                    return res.status(403).send({ status: 'ERR', data: 'Acceso denegado. Su cuenta está inactiva. Comuníquese con el soporte para obtener más información.' })
                }

                if (foundUser.email === req.body.email) {
                    if (isValidPassword(foundUser, req.body.password)) {
                        foundUser._doc.token = jwt.sign({
                            uid: foundUser._id,
                            name: foundUser.firstName + ' ' + foundUser.lastName,
                            email: foundUser.email,
                            role: foundUser.role
                        }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION })
                        return res.status(200).send({ status: 'OK', data: filterData(foundUser._doc, ['password']) })
                    } else {
                        return res.status(401).send({ status: 'ERR', data: 'Email o contraseña incorrectos' })
                    }
                } else {
                    return res.status(401).send({ status: 'ERR', data: 'Email o contraseña incorrectos' })
                }
            } catch (err) {
                return res.status(500).send({ status: 'ERR', data: err.message })
            }
        } else {
            const validationErrors = validationResult(req).array()
            
            return res.status(400).send({ status: 'ERR', data: validationErrors[0].msg })
        }
    })

   
    router.put('/:uid', verifyToken, avoidConsecutiveSpaces, checkEmpty, checkRoles(['admin']),async (req, res) => {
        try {
            if (mongoose.Types.ObjectId.isValid(req.params.uid)) {
                const foundUser = await userModel.findById(req.params.uid)

                if (foundUser === null) {
                    return res.status(404).send({ status: 'ERR', data: 'No existe usuario con ese ID' })
                } else {
                    if (req.body.password) {
                        req.body.password = createHash(req.body.password)
                    }

                    const updatedUser = await userModel.findByIdAndUpdate(req.params.uid, req.body, { new: true })
                    return res.status(200).send({ status: 'OK', data: filterData(updatedUser._doc, ['password']) })
                }
            } else {
                return res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            return res.status(500).send({ status: 'ERR', data: err.message })
        }
    })


    router.delete('/:uid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            const id = req.params.uid
            if (mongoose.Types.ObjectId.isValid(id)) {
                const userToDelete = await userModel.findOneAndDelete({ _id: id });

                if (!userToDelete) {
                    res.status(404).send({ status: 'ERR', data: 'No existe usuario con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: userToDelete })
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

