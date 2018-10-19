'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'mock_group'
  },
  description: String,
  mode: String,
  url: String,
  method: String,
  parameters: String,
  params: Array,
  response_model: String,
  create_at: {
    type: Date,
    default: Date.now
  }
})

schema.index({ project: 1, group: 1, create_at: -1 })

module.exports = mongoose.model('Mock', schema)
