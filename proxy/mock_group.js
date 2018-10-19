'use strict'

const { MockGroup } = require('../models')

module.exports = class MockGroupProxy {
  static newAndSave (docs) {
    return MockGroup.insertMany(docs)
  }

  static getById (mockId) {
    return MockGroup.findById(mockId).populate('project')
  }

  static find (query, opt) {
    return MockGroup.find(query, {}, opt).populate('project')
  }

  static findOne (query, opt) {
    return MockGroup.findOne(query, {}, opt).populate('project')
  }

  static updateById (mock) {
    return MockGroup.update({
      _id: mock.id
    }, {
      $set: {
        name: mock.name,
        description: mock.description
      }
    })
  }

  static updateMany (docs) {
    return Promise.all(docs.map(item => this.updateById(item)))
  }

  static delByIds (mockIds) {
    return MockGroup.remove({
      _id: {
        $in: mockIds
      }
    })
  }

  static del (query) {
    return MockGroup.remove(query)
  }
}
