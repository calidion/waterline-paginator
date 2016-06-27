var sailsMemoryAdapter = require('sails-mongo');
var config = {
  adapters: {
    mongo: sailsMemoryAdapter
  },
  connections: {
    default: {
      adapter: 'mongo',
      url: process.env.MONGO_DB_URL || 'mongodb://127.0.0.1/nodeforum'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};
module.exports = config;
