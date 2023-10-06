import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'images'

const schema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String }
})

schema.plugin(mongoosePaginate)

const imageModel = mongoose.model(collection, schema)

export default imageModel