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

var model = {
  connection: 'default',
  identity: 'model',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    name: 'string',
    type: 'string',
    logo: {
      model: 'image'
    }
  }
};

var image = {
  connection: 'default',
  identity: 'image',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    hash: 'string',
    url: 'string'
  }
};

var waterline = new Waterline();

var connection = Waterline.Collection.extend(model);
waterline.loadCollection(connection);
var connection1 = Waterline.Collection.extend(image);
waterline.loadCollection(connection1);
export default function name(cb) {
  waterline.initialize(config, cb);
  //  waterline.initialize(config, function (error, ontology) {
  //   // ontology.collections[model.name.toLowerCase()];
  // });
}
