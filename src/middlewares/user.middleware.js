import * as url from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/user.models.js'
import { validationResult, body } from 'express-validator';


const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))


const isValidPassword = (userInDb, pass) => {
    return bcrypt.compareSync(pass, userInDb.password);
}

const createHash = (pass)  => {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(10))
}

const filterData = (data, unwantedFields) => {
    const { ...filteredData } = data
    unwantedFields.forEach(field => delete filteredData[field] )
    return filteredData
}

const checkRequired = (requiredFields) => {
    return (req, res, next) => {
        for (const required of requiredFields) {
            if (!req.body.hasOwnProperty(required) || req.body[required].trim() === '') {
                return res.status(400).send({ status: 'ERR', data: `Faltan campos obligatorios (${requiredFields.join(',')})` })
            }
        }
        
        next()
    }
}

const checkReadyLogin = async (req, res, next) => {
    res.locals.foundUser = await userModel.findOne({ email: req.body.email })
    
    if (res.locals.foundUser !== null) {
        next()
    } else {
        res.status(400).send({ status: 'ERR', data: 'El email no se encuentra registrado' })
    }
}

const verifyToken = (req, res, next) => {
    try {
        const headerToken = req.headers.authorization

        if (!headerToken) return res.status(401).send({ status: 'ERR', data: 'Se requiere header con token válido' })
        const token = headerToken.replace('Bearer ', '')

        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send({ status: 'ERR', data: 'El token ha expirado' })
                } else {
                    return res.status(401).send({ status: 'ERR', data: 'El token no es válido' })
                }
            }

            // Si la solicitud incluye un user id en los parámetros, se verifica que coincida con el del token)
            /* if (req.params.uid !== null && req.params.uid !== decoded.uid) {
                return res.status(401).send({ status: 'ERR', data: 'El user id no coincide con el token' })
            } */
            
            req.loggedInUser = decoded
            next()
        })
    } catch(err) {
        return res.status(500).send({ status: 'ERR', data: err.message })
    }
}

const checkRoles = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!requiredRoles.includes(req.loggedInUser.role)) return res.status(403).send({ status: 'ERR', data: 'No tiene autorización para acceder a este recurso' })
            
            next()
        } catch (err) {
            return res.status(500).send({ status: 'ERR', data: err.message })
        }
    }
}

const avoidConsecutiveSpaces = (req, res, next) => {
    const fieldsToCheck = Object.keys(req.body);
    const invalidFields = fieldsToCheck.filter(field => hasConsecutiveSpaces(req.body[field]));

    if (invalidFields.length > 0) {
        return res.status(400).json({
            status: 'ERR',
            data: `No se permiten campos con 2 o más espacios consecutivos en: ${invalidFields.join(', ')}`
        });
    }

    next();
}

const hasConsecutiveSpaces = (text) => /\s{2,}/.test(text)

const checkEmpty = (req, res, next) => {
    try{
        const fieldsToCheck = Object.keys(req.body);
        const invalidFields = fieldsToCheck.filter(field => req.body[field] === '' || req.body[field] === ' ' );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 'ERR',
                data: `No se permiten campos vacíos en: ${invalidFields.join(', ')}`
            });
        }

        next();
    } catch (err) {
        return res.status(500).send({ status: 'ERR', data: err.message })
    }
};

export { __filename, __dirname, createHash, filterData, checkRequired, checkReadyLogin, isValidPassword, verifyToken, checkRoles,   avoidConsecutiveSpaces, checkEmpty }