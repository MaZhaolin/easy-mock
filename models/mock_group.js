'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  name: String,
  description: String,
  create_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'mock_groups'
})

schema.index({ project: 1, create_at: -1 })

module.exports = mongoose.model('mock_group', schema)
