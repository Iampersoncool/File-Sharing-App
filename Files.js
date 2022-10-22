const { Schema, model } = require('mongoose')

const FileSchema = new Schema({
  originalFileName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
})

module.exports = model('Files', FileSchema)
