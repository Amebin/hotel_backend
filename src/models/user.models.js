import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'users'

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, require:true, trim: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    active: { type: Boolean, default: true }
})

schema.plugin(mongoosePaginate)

const userModel = mongoose.model(collection, schema)

export default userModel