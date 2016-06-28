
var Waterline = require('waterline');
var area = require('./models/area');
var image = require('./models/image');
var logo = require('./models/logo');
var areaimage = require('./models/areaimage');
var userarea = require('./models/userarea');

export default function name(config, cb) {
  var waterline = new Waterline();
  var models = [image, logo, area, areaimage, userarea];
  for (var i = 0; i < models.length; i++) {
    var connection = Waterline.Collection.extend(models[i]);
    waterline.loadCollection(connection);
  }
  waterline.initialize(config, cb);
}
