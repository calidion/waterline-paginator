var sailsMemoryAdapter = require('sails-mysql');
var config = {
  adapters: {
    mysql: sailsMemoryAdapter
  },
  connections: {
    default: {
      adapter: 'mysql',
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      prefix: process.env.MYSQL_DB_PREFIX
    }
  },
  defaults: {
    migrate: 'alter'
  }
};
module.exports = config;
