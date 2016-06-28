
var paginate = require('./paginate');
var memory = require('./models.memory');
// var mongo = require('./models.mongo');
// var mysql = require('./models.mysql');

require('./common');

paginate(memory);
// paginate(mongo);
// console.log(mysql);
// paginate(mysql);
