import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'bookings'

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms', required: true }, 
    date: { type: String, required: true }
})

const reservationModel = mongoose.model(collection, schema)

export default reservationModel


