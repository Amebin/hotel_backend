import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'users'

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, require:true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    reserved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'rooms' }],
    active: { type: Boolean, default: true }
})

schema.plugin(mongoosePaginate)

const userModel = mongoose.model(collection, schema)

export default userModel