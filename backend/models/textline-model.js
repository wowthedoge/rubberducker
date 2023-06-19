const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TextLine = new Schema(
    {
        _id: { type: String, required: true },
        indent: { type: Number, required: true }
    }
)

module.exports = mongoose.model('TextLine', TextLine)