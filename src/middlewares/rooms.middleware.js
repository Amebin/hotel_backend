import jwt from 'jsonwebtoken'

const avoidConsecutiveSpaces = (req, res, next) => {
    const { title, description } = req.body

    if (hasConsecutiveSpaces(title) || hasConsecutiveSpaces(description)) {
        return res.status(400).json({
            status: 'ERR',
            data: `No se permiten campos con 2 o mas espacios consecutivos`
        })
    }

    next()
}

const hasConsecutiveSpaces = (text) => /\s{2,}/.test(text)

const isIsoDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('La fecha debe estar en formato ISO8601 válido (YYYY-MM-DD)');
    }
    return true;
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

export { avoidConsecutiveSpaces, isIsoDate, verifyToken, checkRoles, checkRequired }