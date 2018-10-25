'use strict'

const { Mock } = require('../models')

module.exports = class MockProxy {
  static newAndSave(docs) {
    return Mock.insertMany(docs)
  }

  static getById(mockId) {
    return Mock.findById(mockId)
      .populate('group')
      .populate('project')
  }

  static find(query, opt) {
    return Mock.find(query, {}, opt)
      .populate('group')
      .populate('project')
  }

  static findOne(query, opt) {
    return Mock.findOne(query, {}, opt)
      .populate('group')
      .populate('project')
  }

  static updateById(mock) {
    return Mock.update(
      { _id: mock.id },
      {
        $set: {
          url: mock.url,
          mode: mock.mode,
          group: mock.group_id,
          method: mock.method,
          params: mock.params,
          parameters: mock.parameters,
          description: mock.description,
          response_model: mock.response_model
        }
      }
    )
  }

  static updateMany(docs) {
    return Promise.all(docs.map(item => this.updateById(item)))
  }

  static delByIds(mockIds) {
    return Mock.remove({
      _id: {
        $in: mockIds
      }
    })
  }

  static del(query) {
    return Mock.remove(query)
  }
}
