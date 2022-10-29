const { Schema, model } = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const FileSchema = new Schema({
  originalFileName: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    default: uuidv4(),
  },
})

module.exports = model('Files', FileSchema)
