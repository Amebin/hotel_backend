import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'rooms'

const schema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
    avaliableDates: [{ type: String, required: true, default: [] }],
    numberRoom: { type: Number, required: true },
    tipeRoom: { type: String, required: true },
    size: { type: String, required: true },
    capacity: { type: Number, required: true },
})

const roomModel = mongoose.model(collection, schema)

export default roomModel