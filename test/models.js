var sailsMemoryAdapter = require('sails-memory');
var Waterline = require('waterline');
var config = {
  adapters: {
    memory: sailsMemoryAdapter
  },
  connections: {
    default: {
      adapter: 'memory'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};

var area = {
  connection: 'default',
  identity: 'area',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    name: 'string',
    type: 'string',
    logo: {
      model: 'logo'
    }
  }
};

var image = {
  connection: 'default',
  identity: 'image',
  schema: true,
  tableName: 'image',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    hash: 'string',
    url: 'string'
  }
};

var logo = {
  connection: 'default',
  identity: 'logo',
  schema: true,
  tableName: 'logo',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    hash: 'string',
    url: 'string'
  }
};

var areaimage = {
  connection: 'default',
  identity: 'areaimage',
  schema: true,
  tableName: 'areaimage',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    area: {
      model: 'area'
    },
    image: {
      model: 'image'
    }
  }
};

var userarea = {
  connection: 'default',
  identity: 'userarea',
  schema: true,
  tableName: 'areaimage',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    area: {
      model: 'area'
    },
    name: {
      type: 'string'
    }
  }
};

var waterline = new Waterline();
var models = [image, logo, area, areaimage, userarea];
for (var i = 0; i < models.length; i++) {
  var connection = Waterline.Collection.extend(models[i]);
  waterline.loadCollection(connection);
}

export default function name(cb) {
  waterline.initialize(config, cb);
  process.on('uncaughtException', function (e) {
    console.log(e.stack);
    console.log('inside exception');
  });
}
